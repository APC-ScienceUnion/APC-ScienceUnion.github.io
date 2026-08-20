(function () {
  "use strict";

  const E = window.FWZQEngine;
  const {
    ReverseGomoku, EMPTY, BLACK, WHITE, SIZE, CELLS, NO_PENDING,
    other, idxToCoord, dumpRecord, parseRecord, applyRecordResult
  } = E;

  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#board");
  const ctx = canvas.getContext("2d");
  const canvasWrap = $("#canvasWrap");
  const resultOverlay = $("#resultOverlay");
  const thinkingBadge = $("#thinking");
  const statusText = $("#statusText");
  const statusDot = $("#statusDot");
  const clock = $("#clock");
  const modeSelect = $("#modeSelect");
  const difficultySelect = $("#difficultySelect");
  const whiteRestrictSelect = $("#whiteRestrictSelect");
  const suicideToggle = $("#suicideToggle");
  const reviewSlider = $("#reviewSlider");
  const recordInput = $("#recordInput");
  const rulesDialog = $("#rulesDialog");

  const display = {
    arrows: true,
    rays: true,
    danger: false,
    numbers: false,
    sound: true
  };

  let game = createGame();
  let reviewIndex = null;
  let hoverIndex = null;
  let pointerPosition = null;
  let geometry = null;
  let aiWorker = null;
  let aiRequest = 0;
  let aiEpoch = 0;
  let aiThinking = false;
  let aiStartedAt = 0;
  let aiTimer = null;
  let aiDelay = null;
  let lastAiElapsed = 0;
  let notice = "";
  let noticeUntil = 0;
  let toastTimer = null;
  let audioContext = null;
  let moveNumberKey = "";
  let moveNumberCache = null;

  function createGame() {
    return new ReverseGomoku({
      whiteRestrictTurns: Number(whiteRestrictSelect ? whiteRestrictSelect.value : 2),
      lossStartTurns: 8,
      maskSuicide: suicideToggle ? suicideToggle.checked : true
    });
  }

  function colorName(color) { return color === BLACK ? "黑方" : "白方"; }

  function isAiTurn(targetGame) {
    if (!targetGame || targetGame.gameOver) return false;
    const mode = modeSelect.value;
    if (mode === "watch") return true;
    if (mode === "pvp") return false;
    if (mode === "human-black") return targetGame.currentPlayer === WHITE;
    return targetGame.currentPlayer === BLACK;
  }

  function currentView() {
    if (reviewIndex === null) return game;
    try {
      return ReverseGomoku.replay(game.moves.slice(0, reviewIndex), game.config);
    } catch (_error) {
      return game;
    }
  }

  function setNotice(message, duration) {
    notice = message;
    noticeUntil = performance.now() + (duration || 2800);
    renderStatus();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function formatClock(seconds) {
    const safe = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safe / 60);
    const remain = safe - minutes * 60;
    return `${minutes}:${remain.toFixed(1).padStart(4, "0")}`;
  }

  function renderStatus() {
    const viewed = currentView();
    const reviewing = reviewIndex !== null;
    const isBlack = viewed.currentPlayer === BLACK;
    $("#turnStone").className = `turn-stone ${isBlack ? "black" : "white"}`;
    $("#turnLabel").textContent = colorName(viewed.currentPlayer);
    $("#turnCount").textContent = viewed.turnCount;
    $("#moveCount").textContent = viewed.moveCount;
    $("#phaseLabel").textContent = reviewing ? "棋谱复盘" : viewed.pending !== NO_PENDING ? "移子安置" : viewed.gameOver ? "对局结束" : "当前行棋";

    if (performance.now() > noticeUntil) notice = "";
    let message = notice;
    if (!message) {
      if (reviewing) {
        message = `正在复盘第 ${reviewIndex} 手，点击“回到对局”继续。`;
      } else if (viewed.gameOver) {
        message = viewed.isDraw ? "本局和棋。" : `${colorName(viewed.loser)}本局落败，${colorName(other(viewed.loser))}获胜。`;
      } else if (viewed.pending !== NO_PENDING) {
        message = `${colorName(viewed.currentPlayer)}已占领 ${idxToCoord(viewed.pending)}，请沿绿色射线安置手中的${colorName(other(viewed.currentPlayer)).slice(0, 1)}子。`;
      } else if (aiThinking) {
        message = `${colorName(viewed.currentPlayer)} AI 正在评估局面。`;
      } else if (isAiTurn(viewed)) {
        message = `${colorName(viewed.currentPlayer)}由 AI 执子。`;
      } else {
        message = `${colorName(viewed.currentPlayer)}行棋：点击空位落子，或点击可移动的对方棋子。`;
      }
    }
    statusText.textContent = message;
    statusDot.classList.toggle("active", aiThinking);
    thinkingBadge.hidden = !aiThinking;
    canvas.classList.toggle("is-busy", aiThinking);
    canvas.classList.toggle("is-review", reviewing);
    $("#engineLabel").textContent = difficultySelect.value === "hard"
      ? "浏览器启发式 AI · 深入"
      : difficultySelect.value === "easy"
        ? "浏览器启发式 AI · 轻松"
        : "浏览器启发式 AI · 标准";
  }

  function updateReviewControls() {
    const total = game.moves.length;
    const position = reviewIndex === null ? total : reviewIndex;
    reviewSlider.max = String(total);
    reviewSlider.value = String(position);
    $("#reviewPosition").textContent = position;
    $("#reviewTotal").textContent = total;
    $("#reviewPrev").disabled = position <= 0;
    $("#reviewNext").disabled = position >= total;
    $("#reviewLatest").disabled = reviewIndex === null;
  }

  function render() {
    renderStatus();
    updateReviewControls();
    drawBoard();
    const reviewing = reviewIndex !== null;
    if (game.gameOver && !reviewing) {
      $("#resultKicker").textContent = game.isDraw ? "对局结束" : `${colorName(game.loser)}本局落败`;
      $("#resultText").textContent = game.isDraw ? "本局和棋" : `${colorName(other(game.loser))}获胜`;
      resultOverlay.hidden = false;
    } else {
      resultOverlay.hidden = true;
    }
  }

  function ensureCanvasSize() {
    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.max(260, Math.min(rect.width, rect.height || rect.width));
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const width = Math.round(cssSize * dpr);
    if (canvas.width !== width || canvas.height !== width) {
      canvas.width = width;
      canvas.height = width;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const margin = Math.max(25, cssSize * 0.062);
    geometry = { size: cssSize, margin, cell: (cssSize - margin * 2) / (SIZE - 1), dpr };
    return geometry;
  }

  function drawBoard() {
    const g = ensureCanvasSize();
    const viewed = currentView();
    const { size, margin, cell } = g;
    ctx.clearRect(0, 0, size, size);

    const wood = ctx.createLinearGradient(0, 0, size, size);
    wood.addColorStop(0, "#edc58e");
    wood.addColorStop(.48, "#d9a86f");
    wood.addColorStop(1, "#c99158");
    ctx.fillStyle = wood;
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.globalAlpha = .13;
    ctx.strokeStyle = "#8f5b32";
    ctx.lineWidth = 1;
    for (let i = 0; i < 26; i += 1) {
      const y = (i + .5) * size / 26;
      ctx.beginPath();
      for (let x = 0; x <= size; x += 16) {
        const wave = Math.sin(x * .019 + i * 1.73) * (2 + (i % 4));
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(60, 37, 20, .76)";
    ctx.lineWidth = Math.max(1, size / 700);
    for (let i = 0; i < SIZE; i += 1) {
      const p = margin + i * cell;
      ctx.beginPath();
      ctx.moveTo(margin, p);
      ctx.lineTo(size - margin, p);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p, margin);
      ctx.lineTo(p, size - margin);
      ctx.stroke();
    }

    ctx.fillStyle = "#57351d";
    for (const [row, col] of [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]]) {
      ctx.beginPath();
      ctx.arc(margin + col * cell, margin + row * cell, Math.max(2.5, cell * .065), 0, Math.PI * 2);
      ctx.fill();
    }

    drawCoordinates(g);

    const legal = new Set(viewed.legalMoves());
    if (display.danger && !viewed.gameOver) drawDanger(viewed, g);
    if (viewed.pending !== NO_PENDING) drawTargets(viewed, legal, g);
    if (display.rays && hoverIndex !== null && viewed.pending === NO_PENDING && !viewed.gameOver) {
      drawHoverRays(viewed, hoverIndex, g);
    }
    if (hoverIndex !== null && legal.has(hoverIndex) && !viewed.gameOver) drawHover(viewed, hoverIndex, g);
    drawStones(viewed, g);
    if (display.arrows) drawMoveArrow(viewed, g);
    if (viewed.pending !== NO_PENDING && pointerPosition && hoverIndex !== null && legal.has(hoverIndex)) {
      drawHeldStone(viewed, g);
    }

    ctx.save();
    ctx.strokeStyle = "rgba(90, 52, 27, .66)";
    ctx.lineWidth = Math.max(2, size * .006);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, size - ctx.lineWidth, size - ctx.lineWidth);
    ctx.restore();
  }

  function drawCoordinates(g) {
    const { size, margin, cell } = g;
    ctx.save();
    ctx.fillStyle = "rgba(91, 53, 28, .72)";
    ctx.font = `${Math.max(8, cell * .23)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < SIZE; i += 1) {
      const p = margin + i * cell;
      ctx.fillText(String.fromCharCode(65 + i), p, margin * .38);
      ctx.fillText(String.fromCharCode(65 + i), p, size - margin * .36);
      ctx.fillText(String(i), margin * .35, p);
      ctx.fillText(String(i), size - margin * .35, p);
    }
    ctx.restore();
  }

  function positionOf(idx, g) {
    return {
      x: g.margin + (idx % SIZE) * g.cell,
      y: g.margin + Math.floor(idx / SIZE) * g.cell
    };
  }

  function drawDanger(viewed, g) {
    const selfDanger = viewed.dangerCells(viewed.currentPlayer);
    const opponentDanger = new Set(viewed.dangerCells(other(viewed.currentPlayer)));
    for (const idx of selfDanger) drawMarker(idx, g, "rgba(190, 49, 39, .32)", "rgba(160, 34, 28, .82)");
    for (const idx of opponentDanger) {
      if (!selfDanger.includes(idx)) drawMarker(idx, g, "rgba(226, 169, 45, .32)", "rgba(169, 111, 12, .82)");
    }
  }

  function drawMarker(idx, g, fill, stroke) {
    const p = positionOf(idx, g);
    ctx.beginPath();
    ctx.arc(p.x, p.y, g.cell * .31, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = stroke;
    ctx.stroke();
  }

  function drawTargets(_viewed, legal, g) {
    for (const idx of legal) {
      const p = positionOf(idx, g);
      ctx.beginPath();
      ctx.arc(p.x, p.y, g.cell * .25, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(45, 139, 91, .13)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(33, 125, 78, .82)";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(2, g.cell * .065), 0, Math.PI * 2);
      ctx.fillStyle = "rgba(33, 125, 78, .9)";
      ctx.fill();
    }
  }

  function drawHoverRays(viewed, idx, g) {
    if (viewed.board[idx] !== other(viewed.currentPlayer) || viewed.isWhiteRestricted()) return;
    const targets = viewed.relocationTargets(idx);
    if (!targets.length) return;
    const from = positionOf(idx, g);
    ctx.save();
    ctx.strokeStyle = "rgba(91, 69, 173, .38)";
    ctx.fillStyle = "rgba(91, 69, 173, .65)";
    ctx.lineWidth = Math.max(1.5, g.cell * .035);
    for (const target of targets) {
      const to = positionOf(target, g);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(to.x, to.y, Math.max(2, g.cell * .055), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawHover(viewed, idx, g) {
    const p = positionOf(idx, g);
    ctx.beginPath();
    ctx.arc(p.x, p.y, g.cell * .39, 0, Math.PI * 2);
    ctx.fillStyle = viewed.pending !== NO_PENDING ? "rgba(45, 139, 91, .18)" : "rgba(255, 247, 229, .31)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = viewed.pending !== NO_PENDING ? "rgba(35, 122, 76, .9)" : "rgba(255, 250, 240, .75)";
    ctx.stroke();
  }

  function drawStones(viewed, g) {
    let numbers = null;
    if (display.numbers) {
      const key = viewed.moves.join(",");
      if (key !== moveNumberKey || !moveNumberCache) {
        moveNumberKey = key;
        moveNumberCache = viewed.moveNumbers();
      }
      numbers = moveNumberCache;
    }
    const lastIdx = viewed.moves.length ? viewed.moves[viewed.moves.length - 1] : -1;
    for (let idx = 0; idx < CELLS; idx += 1) {
      const color = viewed.board[idx];
      if (color === EMPTY) continue;
      const p = positionOf(idx, g);
      const radius = g.cell * .405;
      ctx.save();
      ctx.shadowColor = "rgba(43, 28, 18, .34)";
      ctx.shadowBlur = g.cell * .13;
      ctx.shadowOffsetY = g.cell * .08;
      const gradient = ctx.createRadialGradient(
        p.x - radius * .35, p.y - radius * .4, radius * .08,
        p.x, p.y, radius
      );
      if (color === BLACK) {
        gradient.addColorStop(0, "#656565");
        gradient.addColorStop(.38, "#242424");
        gradient.addColorStop(1, "#050505");
      } else {
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(.55, "#f0ece4");
        gradient.addColorStop(1, "#c2b9ac");
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      if (idx === lastIdx) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius + 2, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(2, g.cell * .045);
        ctx.strokeStyle = "#c84331";
        ctx.stroke();
      }
      if (numbers && numbers[idx]) {
        ctx.fillStyle = color === BLACK ? "rgba(255,255,255,.82)" : "rgba(34,26,20,.72)";
        ctx.font = `600 ${Math.max(7, g.cell * .22)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(numbers[idx]), p.x, p.y + .5);
      }
    }
  }

  function drawMoveArrow(viewed, g) {
    const arrow = viewed.arrow();
    if (!arrow) return;
    const from = positionOf(arrow.from, g);
    const to = positionOf(arrow.to, g);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const startX = from.x + Math.cos(angle) * g.cell * .43;
    const startY = from.y + Math.sin(angle) * g.cell * .43;
    const endX = to.x - Math.cos(angle) * g.cell * .48;
    const endY = to.y - Math.sin(angle) * g.cell * .48;
    const head = Math.max(7, g.cell * .16);
    ctx.save();
    ctx.strokeStyle = "rgba(39, 92, 191, .84)";
    ctx.fillStyle = "rgba(39, 92, 191, .9)";
    ctx.lineWidth = Math.max(2, g.cell * .055);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - head * Math.cos(angle - .55), endY - head * Math.sin(angle - .55));
    ctx.lineTo(endX - head * Math.cos(angle + .55), endY - head * Math.sin(angle + .55));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawHeldStone(viewed, g) {
    const color = other(viewed.currentPlayer);
    const x = pointerPosition.x;
    const y = pointerPosition.y;
    const radius = g.cell * .27;
    ctx.save();
    ctx.globalAlpha = .7;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color === BLACK ? "#171717" : "#f5f1e8";
    ctx.fill();
    ctx.strokeStyle = color === BLACK ? "#555" : "#bdb3a6";
    ctx.stroke();
    ctx.restore();
  }

  function pointerToCell(event) {
    if (!geometry) ensureCanvasSize();
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.round((x - geometry.margin) / geometry.cell);
    const row = Math.round((y - geometry.margin) / geometry.cell);
    pointerPosition = { x, y };
    if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return null;
    const center = positionOf(row * SIZE + col, geometry);
    if (Math.hypot(x - center.x, y - center.y) > geometry.cell * .48) return null;
    return row * SIZE + col;
  }

  function handleBoardMove(event) {
    const nextHover = pointerToCell(event);
    if (reviewIndex !== null) return;
    if (nextHover === hoverIndex && game.pending === NO_PENDING) return;
    hoverIndex = nextHover;
    drawBoard();
  }

  function handleBoardClick(event) {
    const idx = pointerToCell(event);
    if (idx === null) return;
    if (reviewIndex !== null) {
      showToast("请先回到对局，再继续行棋");
      return;
    }
    if (aiThinking || isAiTurn(game) || game.gameOver) return;
    const legal = new Set(game.legalMoves());
    if (!legal.has(idx)) {
      if (game.pending !== NO_PENDING) setNotice("该位置不在连续可达的直线上。", 2200);
      else if (game.board[idx] === game.currentPlayer) setNotice("不能移动自己的棋子。", 2200);
      else if (game.board[idx] === other(game.currentPlayer) && game.isWhiteRestricted()) setNotice(`白方前 ${game.config.whiteRestrictTurns} 回合不能移子。`, 2500);
      else setNotice("这是一步会立即连五的危险着，当前规则已将它屏蔽。", 2600);
      return;
    }
    playMove(idx, false);
  }

  function playMove(idx, fromAi) {
    const wasPending = game.pending !== NO_PENDING;
    const oldCell = game.board[idx];
    try {
      game.makeMove(idx);
      reviewIndex = null;
      playTone(wasPending || oldCell !== EMPTY ? "move" : "place");
      if (!game.gameOver && game.pending === NO_PENDING) game.resolveStuck();
      render();
      if (game.gameOver) {
        cancelAI(false);
        return;
      }
      scheduleAI(fromAi ? 260 : 330);
    } catch (error) {
      setNotice(error.message || "无法执行该着法", 2600);
    }
  }

  function createWorker() {
    if (aiWorker) return aiWorker;
    aiWorker = new Worker("./ai-worker.js");
    aiWorker.onmessage = handleAiResult;
    aiWorker.onerror = function () {
      setNotice("AI 工作线程启动失败，已切换为双人对战。", 5000);
      modeSelect.value = "pvp";
      cancelAI(true);
      render();
    };
    return aiWorker;
  }

  function scheduleAI(delay) {
    clearTimeout(aiDelay);
    if (game.gameOver || aiThinking || reviewIndex !== null || !isAiTurn(game)) return;
    const epoch = aiEpoch;
    aiDelay = setTimeout(() => {
      if (epoch !== aiEpoch || game.gameOver || !isAiTurn(game)) return;
      requestAiMove();
    }, delay || 180);
  }

  function requestAiMove() {
    if (aiThinking || game.gameOver || !isAiTurn(game)) return;
    game.resolveStuck();
    if (game.gameOver) {
      render();
      return;
    }
    aiThinking = true;
    aiStartedAt = performance.now();
    const requestId = ++aiRequest;
    const epoch = aiEpoch;
    renderStatus();
    updateClock();
    clearInterval(aiTimer);
    aiTimer = setInterval(updateClock, 100);
    try {
      createWorker().postMessage({
        requestId,
        epoch,
        snapshot: game.coreSnapshot(),
        difficulty: difficultySelect.value
      });
    } catch (error) {
      aiThinking = false;
      clearInterval(aiTimer);
      aiTimer = null;
      if (aiWorker) aiWorker.terminate();
      aiWorker = null;
      modeSelect.value = "pvp";
      setNotice(`AI 无法启动，已切换为双人对战：${error.message || error}`, 5000);
      render();
    }
  }

  function handleAiResult(event) {
    const data = event.data || {};
    if (data.requestId !== aiRequest || !aiThinking) return;
    aiThinking = false;
    clearInterval(aiTimer);
    lastAiElapsed = Number(data.elapsed || 0) / 1000;
    updateClock();
    if (data.error) {
      setNotice(`AI 计算失败：${data.error}`, 5000);
      modeSelect.value = "pvp";
      render();
      return;
    }
    if (data.idx === null || data.idx === undefined) {
      game.resolveStuck();
      render();
      return;
    }
    const expectedEpoch = aiEpoch;
    setTimeout(() => {
      if (expectedEpoch !== aiEpoch || game.gameOver || !isAiTurn(game)) return;
      playMove(Number(data.idx), true);
    }, 80);
    renderStatus();
  }

  function updateClock() {
    const seconds = aiThinking ? (performance.now() - aiStartedAt) / 1000 : lastAiElapsed;
    clock.textContent = formatClock(seconds);
  }

  function cancelAI(recreate) {
    aiEpoch += 1;
    aiRequest += 1;
    aiThinking = false;
    clearTimeout(aiDelay);
    clearInterval(aiTimer);
    aiDelay = null;
    aiTimer = null;
    if (recreate && aiWorker) {
      aiWorker.terminate();
      aiWorker = null;
    }
    renderStatus();
  }

  function newGame(message) {
    cancelAI(true);
    game = createGame();
    reviewIndex = null;
    hoverIndex = null;
    lastAiElapsed = 0;
    updateClock();
    setNotice(message || "新对局已开始，黑方先行。", 2400);
    render();
    scheduleAI(420);
  }

  function undoTurn() {
    cancelAI(true);
    reviewIndex = null;
    if (!game.history.length) {
      showToast("现在还没有可以撤销的着法");
      scheduleAI(260);
      return;
    }

    function undoCompleteTurn() {
      if (!game.history.length) return;
      game.undoStep();
      while (game.pending !== NO_PENDING && game.history.length) game.undoStep();
    }

    if (game.pending !== NO_PENDING) {
      game.undoStep();
    } else if (modeSelect.value === "pvp") {
      undoCompleteTurn();
    } else {
      undoCompleteTurn();
      let guard = 0;
      while (game.history.length && isAiTurn(game) && guard < 3) {
        undoCompleteTurn();
        guard += 1;
      }
    }
    setNotice("已撤销上一轮行棋。", 1800);
    render();
    scheduleAI(500);
  }

  function saveRecord() {
    try {
      const text = dumpRecord(game);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fwzq-${new Date().toISOString().slice(0, 10)}.afg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 500);
      showToast("棋谱已保存到下载目录");
    } catch (error) {
      showToast(error.message || "棋谱保存失败");
    }
  }

  async function loadRecord(file) {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      showToast("棋谱文件过大，已拒绝读取");
      return;
    }
    cancelAI(true);
    try {
      const parsed = parseRecord(await file.text());
      if (parsed.moves.length > 1000) throw new Error("棋谱着法数超过限制");
      const loaded = new ReverseGomoku(parsed.config);
      for (let i = 0; i < parsed.moves.length; i += 1) {
        if (loaded.gameOver) throw new Error(`第 ${i + 1} 手位于终局之后`);
        try { loaded.makeMove(parsed.moves[i]); }
        catch (error) { throw new Error(`第 ${i + 1} 手 ${idxToCoord(parsed.moves[i])}：${error.message}`); }
      }
      applyRecordResult(loaded, parsed.result);
      game = loaded;
      whiteRestrictSelect.value = String(game.config.whiteRestrictTurns);
      suicideToggle.checked = game.config.maskSuicide;
      reviewIndex = game.moves.length;
      hoverIndex = null;
      pointerPosition = null;
      lastAiElapsed = 0;
      setNotice(`已读取 ${game.moves.length} 手棋谱（记录结果：${parsed.result}）。`, 4200);
      render();
      scheduleAI(500);
    } catch (error) {
      showToast(`读取失败：${error.message}`);
      render();
    } finally {
      recordInput.value = "";
    }
  }

  function changeReview(delta) {
    const total = game.moves.length;
    const current = reviewIndex === null ? total : reviewIndex;
    reviewIndex = Math.max(0, Math.min(total, current + delta));
    hoverIndex = null;
    pointerPosition = null;
    cancelAI(false);
    render();
  }

  function toggleDisplay(name) {
    display[name] = !display[name];
    const button = document.querySelector(`[data-toggle="${name}"]`);
    if (button) {
      button.classList.toggle("is-on", display[name]);
      button.setAttribute("aria-pressed", String(display[name]));
    }
    drawBoard();
  }

  function playTone(kind) {
    if (!display.sound) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const now = audioContext.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(kind === "place" ? 780 : 420, now);
      osc.frequency.exponentialRampToValueAtTime(kind === "place" ? 520 : 260, now + .09);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.12, now + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .11);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + .12);
    } catch (_error) {
      display.sound = false;
    }
  }

  function openRules() {
    if (typeof rulesDialog.showModal === "function") rulesDialog.showModal();
    else rulesDialog.setAttribute("open", "");
  }

  function bindEvents() {
    canvas.addEventListener("pointermove", handleBoardMove);
    canvas.addEventListener("pointerleave", () => {
      hoverIndex = null;
      pointerPosition = null;
      drawBoard();
    });
    canvas.addEventListener("click", handleBoardClick);

    $("#newGameButton").addEventListener("click", () => newGame());
    $("#overlayNewGame").addEventListener("click", () => newGame());
    $("#undoButton").addEventListener("click", undoTurn);
    $("#saveButton").addEventListener("click", saveRecord);
    $("#loadButton").addEventListener("click", () => recordInput.click());
    recordInput.addEventListener("change", () => loadRecord(recordInput.files[0]));

    modeSelect.addEventListener("change", () => newGame(`已切换为“${modeSelect.options[modeSelect.selectedIndex].text}”。`));
    difficultySelect.addEventListener("change", () => {
      cancelAI(true);
      setNotice(`AI 强度已切换为“${difficultySelect.options[difficultySelect.selectedIndex].text}”。`, 2200);
      render();
      scheduleAI(240);
    });
    whiteRestrictSelect.addEventListener("change", () => newGame("规则已更新，并开始新对局。"));
    suicideToggle.addEventListener("change", () => newGame("规则已更新，并开始新对局。"));

    document.querySelectorAll("[data-toggle]").forEach((button) => {
      button.addEventListener("click", () => toggleDisplay(button.dataset.toggle));
    });

    reviewSlider.addEventListener("input", () => {
      reviewIndex = Number(reviewSlider.value);
      hoverIndex = null;
      pointerPosition = null;
      cancelAI(false);
      render();
    });
    $("#reviewPrev").addEventListener("click", () => changeReview(-1));
    $("#reviewNext").addEventListener("click", () => changeReview(1));
    $("#reviewLatest").addEventListener("click", () => {
      reviewIndex = null;
      render();
      scheduleAI(250);
    });

    $("#rulesButton").addEventListener("click", openRules);
    $("#rulesTextButton").addEventListener("click", openRules);

    window.addEventListener("keydown", (event) => {
      const tag = event.target && event.target.tagName;
      if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;
      const key = event.key.toLowerCase();
      if (key === "r") newGame();
      else if (key === "u") undoTurn();
      else if (key === "d") toggleDisplay("danger");
      else if (key === "n") toggleDisplay("numbers");
      else if (key === "a") toggleDisplay("arrows");
      else if (key === "h") toggleDisplay("rays");
      else if (key === "m") toggleDisplay("sound");
      else if (event.key === "ArrowLeft") changeReview(-1);
      else if (event.key === "ArrowRight") changeReview(1);
      else return;
      event.preventDefault();
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(() => drawBoard()).observe(canvasWrap);
    } else {
      window.addEventListener("resize", drawBoard);
    }
  }

  bindEvents();
  updateClock();
  render();
  scheduleAI(450);
})();
