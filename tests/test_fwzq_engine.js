"use strict";

const assert = require("node:assert/strict");
const {
  ReverseGomoku, EMPTY, BLACK, WHITE, NO_PENDING,
  dumpRecord, parseRecord, applyRecordResult
} = require("../source/fwzq/engine.js");

function test(name, fn) {
  try {
    fn();
    process.stdout.write(`ok - ${name}\n`);
  } catch (error) {
    process.stderr.write(`not ok - ${name}\n${error.stack}\n`);
    process.exitCode = 1;
  }
}

function occupied(game) {
  return Array.from(game.board).filter((cell) => cell !== EMPTY).length;
}

test("初始局面有 225 个合法落点", () => {
  const game = new ReverseGomoku();
  assert.equal(game.currentPlayer, BLACK);
  assert.equal(game.pending, NO_PENDING);
  assert.equal(game.legalMoves().length, 225);
});

test("普通落子切换玩家并增加一个回合", () => {
  const game = new ReverseGomoku();
  game.makeMove(112);
  assert.equal(game.board[112], BLACK);
  assert.equal(game.currentPlayer, WHITE);
  assert.equal(game.turnCount, 1);
  assert.equal(game.whiteTurns, 0);
  assert.equal(game.moveCount, 1);
});

test("白方前两回合不能占领", () => {
  const game = new ReverseGomoku();
  game.makeMove(112);
  assert.equal(game.legalSet().has(112), false);
  game.whiteTurns = 2;
  assert.equal(game.legalSet().has(112), true);
});

test("安置射线不能越过阻挡棋子", () => {
  const game = new ReverseGomoku({ maskSuicide: false });
  game.currentPlayer = BLACK;
  game.pending = 112;
  game.board[112] = BLACK;
  for (const idx of [82, 142, 110, 114, 80, 84, 140, 144]) game.board[idx] = WHITE;
  assert.deepEqual(game.legalMoves().sort((a, b) => a - b), [96, 97, 98, 111, 113, 126, 127, 128]);
});

test("占领与安置共同构成一个回合", () => {
  const game = new ReverseGomoku({ maskSuicide: false });
  game.board[112] = WHITE;
  game.makeMove(112);
  assert.equal(game.board[112], BLACK);
  assert.equal(game.pending, 112);
  assert.equal(game.currentPlayer, BLACK);
  assert.equal(game.turnCount, 0);
  game.makeMove(113);
  assert.equal(game.board[113], WHITE);
  assert.equal(game.pending, NO_PENDING);
  assert.equal(game.currentPlayer, WHITE);
  assert.equal(game.turnCount, 1);
  assert.equal(game.moveCount, 2);
});

test("白方完成移子时只增加一次白方回合", () => {
  const game = new ReverseGomoku({ maskSuicide: false });
  game.currentPlayer = WHITE;
  game.whiteTurns = 2;
  game.turnCount = 5;
  game.board[112] = BLACK;
  game.makeMove(112);
  assert.equal(game.whiteTurns, 2);
  game.makeMove(113);
  assert.equal(game.whiteTurns, 3);
  assert.equal(game.turnCount, 6);
});

test("默认规则过滤立即连五的自杀着", () => {
  const safe = new ReverseGomoku({ maskSuicide: true, lossStartTurns: 8 });
  for (const idx of [108, 109, 110, 111]) safe.board[idx] = BLACK;
  safe.turnCount = 8;
  assert.equal(safe.legalSet().has(112), false);

  const open = new ReverseGomoku({ maskSuicide: false, lossStartTurns: 8 });
  for (const idx of [108, 109, 110, 111]) open.board[idx] = BLACK;
  open.turnCount = 8;
  open.makeMove(112);
  assert.equal(open.gameOver, true);
  assert.equal(open.loser, BLACK);
});

test("安置对方棋子形成五连时对方落败", () => {
  const game = new ReverseGomoku({ maskSuicide: false, lossStartTurns: 8 });
  game.pending = 112;
  game.currentPlayer = BLACK;
  game.turnCount = 8;
  game.board[112] = BLACK;
  for (const idx of [114, 115, 116, 117]) game.board[idx] = WHITE;
  game.makeMove(113);
  assert.equal(game.gameOver, true);
  assert.equal(game.loser, WHITE);
  assert.equal(game.pending, NO_PENDING);
});

test("悔棋可逐步精确恢复移子状态", () => {
  const game = new ReverseGomoku({ maskSuicide: false });
  game.board[112] = WHITE;
  const before = game.coreSnapshot();
  game.makeMove(112);
  game.makeMove(113);
  assert.equal(game.undoStep(), true);
  assert.equal(game.pending, 112);
  assert.equal(game.board[113], EMPTY);
  assert.equal(game.undoStep(), true);
  assert.deepEqual(game.coreSnapshot(), before);
});

test("AFG 棋谱可往返并兼容移子两步", () => {
  const game = new ReverseGomoku({ maskSuicide: false });
  game.board[112] = WHITE;
  game.makeMove(112);
  game.makeMove(113);
  const parsed = parseRecord(dumpRecord(game));
  assert.deepEqual(parsed.moves, [112, 113]);
  assert.equal(parsed.config.maskSuicide, false);
  assert.deepEqual(parseRecord("moves: H7 # 中央落子\nI7").moves, [112, 113]);
});

test("占领第一步终局可通过棋谱结果恢复", () => {
  const game = new ReverseGomoku({ maskSuicide: false, lossStartTurns: 8 });
  for (const idx of [108, 109, 110, 111]) game.board[idx] = BLACK;
  game.board[112] = WHITE;
  game.turnCount = 8;
  game.makeMove(112);
  assert.equal(game.pending, 112);
  assert.equal(game.gameOver, true);

  const parsed = parseRecord(dumpRecord(game));
  assert.deepEqual(parsed.moves, []);
  assert.equal(parsed.result, "白胜");
  const restored = applyRecordResult(new ReverseGomoku(parsed.config), parsed.result);
  assert.equal(restored.gameOver, true);
  assert.equal(restored.loser, BLACK);
});

test("无合法着与满盘和棋得到不同终局", () => {
  const stuck = new ReverseGomoku({ maskSuicide: true, lossStartTurns: 8 });
  stuck.board.fill(BLACK);
  stuck.board[112] = EMPTY;
  stuck.turnCount = 224;
  assert.deepEqual(stuck.legalMoves(), []);
  stuck.resolveStuck();
  assert.equal(stuck.gameOver, true);
  assert.equal(stuck.isDraw, false);
  assert.equal(stuck.loser, BLACK);

  const draw = new ReverseGomoku({ maskSuicide: false, lossStartTurns: 8 });
  for (let row = 0; row < 15; row += 1) {
    for (let col = 0; col < 15; col += 1) {
      draw.board[row * 15 + col] = (row + 2 * col) % 4 < 2 ? BLACK : WHITE;
    }
  }
  draw.board[223] = EMPTY;
  draw.turnCount = 224;
  draw.whiteTurns = 112;
  draw.currentPlayer = BLACK;
  draw.makeMove(223);
  assert.equal(draw.gameOver, true);
  assert.equal(draw.isDraw, true);
  assert.equal(draw.loser, EMPTY);
});

test("随机合法对局维持状态不变量", () => {
  const game = new ReverseGomoku();
  let seed = 20260820;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  for (let step = 0; step < 120 && !game.gameOver; step += 1) {
    const legal = game.legalMoves();
    if (!legal.length) {
      game.resolveStuck();
      break;
    }
    game.makeMove(legal[Math.floor(random() * legal.length)]);
    assert.equal(occupied(game), game.turnCount);
    assert.equal(game.whiteTurns, Math.floor(game.turnCount / 2));
    assert.equal(game.currentPlayer, game.turnCount % 2 ? WHITE : BLACK);
    assert.equal(game.history.length, game.moveCount);
  }
});

test("非法输入不会改变局面", () => {
  const game = new ReverseGomoku();
  const before = game.coreSnapshot();
  assert.throws(() => game.makeMove(-1), /越界/);
  assert.throws(() => game.makeMove(225), /越界/);
  assert.throws(() => game.makeMove(1.5), /越界/);
  assert.deepEqual(game.coreSnapshot(), before);
});

if (process.exitCode) process.exit(process.exitCode);
