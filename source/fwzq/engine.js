(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.FWZQEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = 2;
  const SIZE = 15;
  const CELLS = SIZE * SIZE;
  const NO_PENDING = -1;
  const WIN_STREAK = 5;
  const DIRECTIONS = Object.freeze([
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ]);
  const AXES = Object.freeze([[0, 1], [1, 0], [1, 1], [1, -1]]);
  const DEFAULT_CONFIG = Object.freeze({
    whiteRestrictTurns: 2,
    lossStartTurns: 8,
    maskSuicide: true
  });

  function other(color) {
    return color === BLACK ? WHITE : BLACK;
  }

  function normalizeConfig(config) {
    const input = config || {};
    return {
      whiteRestrictTurns: clampInt(input.whiteRestrictTurns, 0, 20, DEFAULT_CONFIG.whiteRestrictTurns),
      lossStartTurns: clampInt(input.lossStartTurns, 0, 224, DEFAULT_CONFIG.lossStartTurns),
      maskSuicide: input.maskSuicide !== undefined ? Boolean(input.maskSuicide) : DEFAULT_CONFIG.maskSuicide
    };
  }

  function clampInt(value, min, max, fallback) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, Math.trunc(parsed)));
  }

  function assertIndex(idx) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= CELLS) {
      throw new RangeError("棋盘坐标越界: " + String(idx));
    }
  }

  function rowOf(idx) { return Math.floor(idx / SIZE); }
  function colOf(idx) { return idx % SIZE; }
  function inside(row, col) { return row >= 0 && row < SIZE && col >= 0 && col < SIZE; }

  function checkWinAt(board, idx, color) {
    assertIndex(idx);
    const row = rowOf(idx);
    const col = colOf(idx);
    for (const [dr, dc] of AXES) {
      let count = 1;
      let r = row + dr;
      let c = col + dc;
      while (inside(r, c) && board[r * SIZE + c] === color) {
        count += 1;
        r += dr;
        c += dc;
      }
      r = row - dr;
      c = col - dc;
      while (inside(r, c) && board[r * SIZE + c] === color) {
        count += 1;
        r -= dr;
        c -= dc;
      }
      if (count >= WIN_STREAK) return true;
    }
    return false;
  }

  function wouldMakeFive(board, idx, color) {
    const old = board[idx];
    board[idx] = color;
    const result = checkWinAt(board, idx, color);
    board[idx] = old;
    return result;
  }

  function hasEmpty(board) {
    for (let i = 0; i < CELLS; i += 1) if (board[i] === EMPTY) return true;
    return false;
  }

  function resultName(game) {
    if (!game.gameOver) return "未完";
    if (game.isDraw) return "和棋";
    return game.loser === BLACK ? "白胜" : "黑胜";
  }

  function applyRecordResult(game, result) {
    if (!game || game.gameOver) return game;
    const normalized = String(result || "").trim();
    if (normalized === "和棋") {
      game.gameOver = true;
      game.isDraw = true;
      game.loser = EMPTY;
    } else if (normalized === "黑胜" || normalized === "白胜") {
      game.gameOver = true;
      game.isDraw = false;
      game.loser = normalized === "黑胜" ? WHITE : BLACK;
    }
    return game;
  }

  class ReverseGomoku {
    constructor(config) {
      this.config = normalizeConfig(config);
      this.reset();
    }

    reset() {
      this.board = new Uint8Array(CELLS);
      this.currentPlayer = BLACK;
      this.gameOver = false;
      this.loser = EMPTY;
      this.isDraw = false;
      this.moveCount = 0;
      this.turnCount = 0;
      this.whiteTurns = 0;
      this.pending = NO_PENDING;
      this.history = [];
      this.moves = [];
    }

    coreSnapshot() {
      return {
        board: Array.from(this.board),
        currentPlayer: this.currentPlayer,
        gameOver: this.gameOver,
        loser: this.loser,
        isDraw: this.isDraw,
        moveCount: this.moveCount,
        turnCount: this.turnCount,
        whiteTurns: this.whiteTurns,
        pending: this.pending,
        config: { ...this.config },
        moves: this.moves.slice()
      };
    }

    _undoSnapshot() {
      return {
        board: this.board.slice(),
        currentPlayer: this.currentPlayer,
        gameOver: this.gameOver,
        loser: this.loser,
        isDraw: this.isDraw,
        moveCount: this.moveCount,
        turnCount: this.turnCount,
        whiteTurns: this.whiteTurns,
        pending: this.pending
      };
    }

    restore(snapshot, keepMoves) {
      if (!snapshot || !snapshot.board || snapshot.board.length !== CELLS) {
        throw new TypeError("无效的反五子棋状态");
      }
      this.board = Uint8Array.from(snapshot.board);
      this.currentPlayer = snapshot.currentPlayer;
      this.gameOver = Boolean(snapshot.gameOver);
      this.loser = snapshot.loser || EMPTY;
      this.isDraw = Boolean(snapshot.isDraw);
      this.moveCount = snapshot.moveCount || 0;
      this.turnCount = snapshot.turnCount || 0;
      this.whiteTurns = snapshot.whiteTurns || 0;
      this.pending = Number.isInteger(snapshot.pending) ? snapshot.pending : NO_PENDING;
      if (snapshot.config) this.config = normalizeConfig(snapshot.config);
      if (!keepMoves) this.moves = Array.isArray(snapshot.moves) ? snapshot.moves.slice() : [];
      this.history = [];
      return this;
    }

    clone() {
      return new ReverseGomoku(this.config).restore(this.coreSnapshot());
    }

    static fromSnapshot(snapshot) {
      return new ReverseGomoku(snapshot && snapshot.config).restore(snapshot);
    }

    isWhiteRestricted() {
      return this.currentPlayer === WHITE &&
        this.config.whiteRestrictTurns > 0 &&
        this.whiteTurns < this.config.whiteRestrictTurns;
    }

    relocationTargets(origin) {
      assertIndex(origin);
      const targets = [];
      const row = rowOf(origin);
      const col = colOf(origin);
      for (const [dr, dc] of DIRECTIONS) {
        let r = row + dr;
        let c = col + dc;
        while (inside(r, c)) {
          const idx = r * SIZE + c;
          if (this.board[idx] !== EMPTY) break;
          targets.push(idx);
          r += dr;
          c += dc;
        }
      }
      return targets;
    }

    canCapture(idx) {
      if (this.pending !== NO_PENDING || this.isWhiteRestricted()) return false;
      if (this.board[idx] !== other(this.currentPlayer)) return false;
      return this.relocationTargets(idx).length > 0;
    }

    legalMoves() {
      if (this.gameOver) return [];
      if (this.pending !== NO_PENDING) return this.relocationTargets(this.pending);

      const legal = [];
      const opponent = other(this.currentPlayer);
      const restrictCapture = this.isWhiteRestricted();
      const filterSuicide = this.config.maskSuicide && this.turnCount >= this.config.lossStartTurns;

      for (let idx = 0; idx < CELLS; idx += 1) {
        const cell = this.board[idx];
        let valid = cell === EMPTY;
        if (!valid && cell === opponent && !restrictCapture) {
          valid = this.relocationTargets(idx).length > 0;
        }
        if (valid && filterSuicide && wouldMakeFive(this.board, idx, this.currentPlayer)) {
          valid = false;
        }
        if (valid) legal.push(idx);
      }
      return legal;
    }

    legalSet() {
      return new Set(this.legalMoves());
    }

    resolveStuck() {
      if (this.gameOver) return false;
      const legal = this.legalMoves();
      if (legal.length === 0) {
        this.gameOver = true;
        if (hasEmpty(this.board)) {
          this.loser = this.currentPlayer;
          this.isDraw = false;
        } else {
          this.loser = EMPTY;
          this.isDraw = true;
        }
        return true;
      }
      return false;
    }

    makeMove(idx, options) {
      assertIndex(idx);
      if (this.gameOver) throw new Error("对局已经结束");
      const validate = !options || options.validate !== false;
      if (validate && !this.legalSet().has(idx)) throw new Error("非法着法: " + idxToCoord(idx));

      const before = this._undoSnapshot();
      const player = this.currentPlayer;
      const opponent = other(player);
      const lossActive = this.turnCount >= this.config.lossStartTurns;
      const pendingBefore = this.pending;
      const oldCell = this.board[idx];
      let kind;

      if (pendingBefore === NO_PENDING && oldCell === opponent) {
        kind = "capture";
        this.board[idx] = player;
        this.pending = idx;
        if (lossActive && checkWinAt(this.board, idx, player)) {
          this.gameOver = true;
          this.loser = player;
        }
      } else if (pendingBefore === NO_PENDING) {
        kind = "place";
        this.board[idx] = player;
        this.pending = NO_PENDING;
        this.turnCount += 1;
        if (player === WHITE) this.whiteTurns += 1;
        this.currentPlayer = opponent;
        if (lossActive && checkWinAt(this.board, idx, player)) {
          this.gameOver = true;
          this.loser = player;
        }
      } else {
        kind = "relocate";
        this.board[idx] = opponent;
        this.pending = NO_PENDING;
        this.turnCount += 1;
        if (player === WHITE) this.whiteTurns += 1;
        this.currentPlayer = opponent;
        if (lossActive && checkWinAt(this.board, idx, opponent)) {
          this.gameOver = true;
          this.loser = opponent;
        }
      }

      this.moveCount += 1;
      this.moves.push(idx);
      this.history.push({ before, idx, player, pendingBefore, kind });

      if (!this.gameOver && this.pending === NO_PENDING && !hasEmpty(this.board)) {
        this.gameOver = true;
        this.isDraw = true;
        this.loser = EMPTY;
      }
      return { idx, player, kind, pendingBefore };
    }

    undoStep() {
      const entry = this.history.pop();
      if (!entry) return false;
      const state = entry.before;
      this.board = state.board;
      this.currentPlayer = state.currentPlayer;
      this.gameOver = state.gameOver;
      this.loser = state.loser;
      this.isDraw = state.isDraw;
      this.moveCount = state.moveCount;
      this.turnCount = state.turnCount;
      this.whiteTurns = state.whiteTurns;
      this.pending = state.pending;
      this.moves.pop();
      return true;
    }

    dangerCells(color) {
      const out = [];
      for (let idx = 0; idx < CELLS; idx += 1) {
        if (this.board[idx] === EMPTY && wouldMakeFive(this.board, idx, color)) out.push(idx);
      }
      return out;
    }

    moveNumbers() {
      const numbers = new Int16Array(CELLS);
      const replay = new ReverseGomoku({ ...this.config, maskSuicide: false });
      for (let i = 0; i < this.moves.length; i += 1) {
        const idx = this.moves[i];
        if (replay.gameOver) break;
        replay.makeMove(idx);
        numbers[idx] = i + 1;
      }
      return numbers;
    }

    arrow() {
      const last = this.history[this.history.length - 1];
      if (!last || last.kind !== "relocate") return null;
      return { from: last.pendingBefore, to: last.idx };
    }

    static replay(moves, config) {
      const game = new ReverseGomoku(config);
      for (const raw of moves) {
        if (game.gameOver) break;
        game.makeMove(Number(raw));
      }
      return game;
    }
  }

  function idxToCoord(idx) {
    assertIndex(idx);
    return String.fromCharCode(65 + colOf(idx)) + rowOf(idx);
  }

  function coordToIdx(token) {
    const text = String(token || "").trim().toUpperCase();
    if (!/^[A-O](?:[0-9]|1[0-4])$/.test(text)) throw new Error("非法坐标: " + text);
    const col = text.charCodeAt(0) - 65;
    const row = Number(text.slice(1));
    return row * SIZE + col;
  }

  function dumpRecord(game) {
    let moves = game.moves.slice();
    if (game.pending !== NO_PENDING && game.gameOver) moves = moves.slice(0, -1);
    if (game.pending !== NO_PENDING && !game.gameOver) throw new Error("移子待定中，请先完成安置再保存");
    const cfg = game.config;
    return [
      "[AntiFive 1.0]",
      `[Config 15x15 white_restrict=${cfg.whiteRestrictTurns} loss_start=${cfg.lossStartTurns} mask_suicide=${cfg.maskSuicide ? 1 : 0}]`,
      `[Result ${resultName(game)}]`,
      `[Moves ${moves.length}]`,
      "moves:",
      moves.map(idxToCoord).join(" ")
    ].join("\n") + "\n";
  }

  function parseRecord(text) {
    const moves = [];
    const config = normalizeConfig();
    let result = "未完";
    let inAnalysis = false;
    for (const rawLine of String(text || "").split(/\r?\n/)) {
      let line = rawLine.trim();
      const commentAt = line.indexOf("#");
      if (commentAt >= 0) line = line.slice(0, commentAt).trim();
      if (!line || line.startsWith("#")) continue;
      if (line.startsWith("[")) {
        inAnalysis = false;
        const body = line.replace(/^\[|\]$/g, "").trim();
        if (body.startsWith("Config")) {
          for (const item of body.slice(6).trim().split(/\s+/)) {
            const [key, value] = item.split("=");
            if (key === "white_restrict") config.whiteRestrictTurns = clampInt(value, 0, 20, 2);
            if (key === "loss_start") config.lossStartTurns = clampInt(value, 0, 224, 8);
            if (key === "mask_suicide") config.maskSuicide = value !== "0";
          }
        } else if (body.startsWith("Result")) {
          result = body.slice(6).trim() || "未完";
        } else if (body.startsWith("Analysis")) {
          inAnalysis = true;
        }
        continue;
      }
      if (inAnalysis) continue;
      if (/^moves\s*:/i.test(line)) {
        line = line.replace(/^moves\s*:/i, "").trim();
        if (!line) continue;
      }
      for (const token of line.split(/\s+/)) moves.push(coordToIdx(token));
    }
    return { moves, config: normalizeConfig(config), result };
  }

  return Object.freeze({
    EMPTY, BLACK, WHITE, SIZE, CELLS, NO_PENDING, WIN_STREAK,
    DIRECTIONS, AXES, DEFAULT_CONFIG, ReverseGomoku,
    other, checkWinAt, wouldMakeFive, idxToCoord, coordToIdx,
    dumpRecord, parseRecord, resultName, applyRecordResult, normalizeConfig
  });
});
