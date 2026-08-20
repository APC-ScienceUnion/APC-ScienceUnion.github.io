"use strict";

importScripts("./engine.js");

const {
  ReverseGomoku, EMPTY, BLACK, WHITE, SIZE, CELLS, AXES, other
} = self.FWZQEngine;

let nodes = 0;

self.onmessage = function (event) {
  const { requestId, snapshot, difficulty } = event.data || {};
  const started = performance.now();
  try {
    const game = ReverseGomoku.fromSnapshot(snapshot);
    const idx = chooseMove(game, difficulty || "medium", started);
    self.postMessage({
      requestId,
      idx,
      nodes,
      elapsed: performance.now() - started
    });
  } catch (error) {
    self.postMessage({ requestId, error: error && error.message ? error.message : String(error) });
  }
};

function chooseMove(game, difficulty, started) {
  nodes = 0;
  game.resolveStuck();
  if (game.gameOver) return null;
  const legal = game.legalMoves();
  if (!legal.length) return null;

  if (difficulty === "easy") {
    const tactical = immediateTactics(game, legal);
    if (tactical.length && Math.random() < 0.75) return pick(tactical);
    return pick(legal);
  }

  const perspective = game.currentPlayer;
  const deadline = started + (difficulty === "hard" ? 1450 : 560);
  const ordered = orderCandidates(game, legal, difficulty === "hard" ? 76 : 112);
  let bestScore = -Infinity;
  let bestMoves = [];

  for (const idx of ordered) {
    if (performance.now() > deadline && bestMoves.length) break;
    const score = fullTurnScore(game, idx, perspective, difficulty === "hard", deadline);
    if (score > bestScore + 0.001) {
      bestScore = score;
      bestMoves = [idx];
    } else if (Math.abs(score - bestScore) <= 0.001) {
      bestMoves.push(idx);
    }
  }
  return pick(bestMoves.length ? bestMoves : ordered);
}

function immediateTactics(game, legal) {
  const perspective = game.currentPlayer;
  const winning = [];
  for (const idx of legal) {
    const score = fullTurnScore(game, idx, perspective, false, performance.now() + 80);
    if (score > 5e8) winning.push(idx);
  }
  return winning;
}

function fullTurnScore(game, firstIdx, perspective, lookAhead, deadline) {
  nodes += 1;
  const actor = game.currentPlayer;
  const next = game.clone();
  next.makeMove(firstIdx);
  if (next.gameOver) return terminalScore(next, perspective);

  if (next.pending !== -1 && next.currentPlayer === actor) {
    const targets = orderCandidates(next, next.legalMoves(), 72);
    let selected = actor === perspective ? -Infinity : Infinity;
    for (const target of targets) {
      if (performance.now() > deadline && Number.isFinite(selected)) break;
      const completed = next.clone();
      completed.makeMove(target);
      nodes += 1;
      const value = completed.gameOver
        ? terminalScore(completed, perspective)
        : afterTurnScore(completed, perspective, lookAhead, deadline);
      selected = actor === perspective ? Math.max(selected, value) : Math.min(selected, value);
    }
    return selected;
  }

  return afterTurnScore(next, perspective, lookAhead, deadline);
}

function afterTurnScore(game, perspective, lookAhead, deadline) {
  if (game.gameOver) return terminalScore(game, perspective);
  let base = evaluate(game, perspective);
  if (!lookAhead || performance.now() > deadline) return base;

  const opponentMoves = orderCandidates(game, game.legalMoves(), 24);
  if (!opponentMoves.length) {
    const stuck = game.clone();
    stuck.resolveStuck();
    return terminalScore(stuck, perspective);
  }

  let worst = Infinity;
  for (const reply of opponentMoves) {
    if (performance.now() > deadline && Number.isFinite(worst)) break;
    const replyScore = fullTurnScore(game, reply, perspective, false, deadline);
    worst = Math.min(worst, replyScore);
  }
  if (!Number.isFinite(worst)) return base;
  return base * 0.28 + worst * 0.72;
}

function terminalScore(game, perspective) {
  if (!game.gameOver) return evaluate(game, perspective);
  if (game.isDraw) return 0;
  return game.loser === perspective ? -1e9 + game.moveCount : 1e9 - game.moveCount;
}

function evaluate(game, perspective) {
  nodes += 1;
  const opponent = other(perspective);
  const own = lineProfile(game.board, perspective);
  const foe = lineProfile(game.board, opponent);
  let score = foe.score - own.score;

  if (game.turnCount >= 6) {
    score += (game.dangerCells(opponent).length - game.dangerCells(perspective).length) * 68;
  }

  score += centralShape(game.board, opponent) - centralShape(game.board, perspective);
  if (game.currentPlayer === perspective) score += 2;
  return score;
}

function lineProfile(board, color) {
  const weights = [0, 1, 9, 58, 510, 50000, 90000, 130000, 180000, 240000, 320000, 410000, 510000, 620000, 740000, 880000];
  let score = 0;
  let longest = 0;
  for (const [dr, dc] of AXES) {
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        const prevR = row - dr;
        const prevC = col - dc;
        if (inside(prevR, prevC) && board[prevR * SIZE + prevC] === color) continue;
        if (board[row * SIZE + col] !== color) continue;
        let r = row;
        let c = col;
        let length = 0;
        while (inside(r, c) && board[r * SIZE + c] === color) {
          length += 1;
          r += dr;
          c += dc;
        }
        longest = Math.max(longest, length);
        const beforeOpen = inside(prevR, prevC) && board[prevR * SIZE + prevC] === EMPTY;
        const afterOpen = inside(r, c) && board[r * SIZE + c] === EMPTY;
        const openness = Number(beforeOpen) + Number(afterOpen);
        score += weights[Math.min(length, weights.length - 1)] * (1 + openness * 0.18);
      }
    }
  }
  return { score, longest };
}

function centralShape(board, color) {
  let score = 0;
  for (let idx = 0; idx < CELLS; idx += 1) {
    if (board[idx] !== color) continue;
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    score += Math.max(0, 8 - (Math.abs(row - 7) + Math.abs(col - 7)) * 0.45);
  }
  return score;
}

function orderCandidates(game, moves, limit) {
  const player = game.currentPlayer;
  const opponent = other(player);
  const pending = game.pending;
  const scored = moves.map((idx) => {
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    let score = -(Math.abs(row - 7) + Math.abs(col - 7)) * 0.8;
    if (pending !== -1) {
      const test = game.clone();
      test.makeMove(idx);
      if (test.gameOver && test.loser === opponent) score += 1e7;
      score += neighborCount(test.board, idx, opponent) * 18;
    } else {
      if (game.board[idx] === opponent) score += 95;
      score += neighborCount(game.board, idx, player) * 5;
      score += neighborCount(game.board, idx, opponent) * 9;
      const test = game.clone();
      test.makeMove(idx);
      if (test.gameOver && test.loser === opponent) score += 1e7;
      if (test.pending !== -1) {
        const targets = test.legalMoves();
        for (const target of targets) {
          const finish = test.clone();
          finish.makeMove(target);
          if (finish.gameOver && finish.loser === opponent) {
            score += 5e6;
            break;
          }
        }
      }
    }
    return { idx, score: score + Math.random() * 0.01 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, Math.min(limit || scored.length, scored.length))).map((x) => x.idx);
}

function neighborCount(board, idx, color) {
  const row = Math.floor(idx / SIZE);
  const col = idx % SIZE;
  let count = 0;
  for (let dr = -2; dr <= 2; dr += 1) {
    for (let dc = -2; dc <= 2; dc += 1) {
      if (!dr && !dc) continue;
      const r = row + dr;
      const c = col + dc;
      if (inside(r, c) && board[r * SIZE + c] === color) count += 1;
    }
  }
  return count;
}

function inside(row, col) {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}
