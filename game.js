(() => {
  // ── Constants ───────────────────────────────────────────────────────────────
  const COLS = 20;
  const ROWS = 20;
  const CELL = 20; // px per cell (400 / 20)
  const BASE_INTERVAL = 150; // ms

  // Colors
  const COLOR_BG       = '#0f0f23';
  const COLOR_GRID     = 'rgba(255,255,255,0.03)';
  const COLOR_SNAKE    = '#4caf50';
  const COLOR_HEAD     = '#388e3c';
  const COLOR_FOOD     = '#f44336';
  const COLOR_OVERLAY  = 'rgba(0,0,0,0.65)';
  const COLOR_TEXT     = '#ffffff';
  const COLOR_SUBTEXT  = '#aaaaaa';

  // ── State ────────────────────────────────────────────────────────────────────
  const STATE = { IDLE: 0, PLAYING: 1, GAME_OVER: 2 };
  let state = STATE.IDLE;

  let snake   = [];      // [{x,y}, …]  head is index 0
  let dir     = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food    = { x: 0, y: 0 };
  let score   = 0;
  let highScore = parseInt(localStorage.getItem('snakeHighScore') || '0', 10);
  let intervalId = null;

  // ── DOM ──────────────────────────────────────────────────────────────────────
  const canvas    = document.getElementById('gameCanvas');
  const ctx       = canvas.getContext('2d');
  const scoreEl   = document.getElementById('score');
  const hiScoreEl = document.getElementById('high-score');
  const hintEl    = document.getElementById('hint');

  // ── Initialise ───────────────────────────────────────────────────────────────
  hiScoreEl.textContent = highScore;
  drawIdleScreen();

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function setScore(n) {
    score = n;
    scoreEl.textContent = score;
    if (score > highScore) {
      highScore = score;
      hiScoreEl.textContent = highScore;
      localStorage.setItem('snakeHighScore', highScore);
    }
  }

  function spawnFood() {
    const free = [];
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        if (!snake.some(s => s.x === x && s.y === y)) {
          free.push({ x, y });
        }
      }
    }
    if (free.length === 0) return; // board full – perfect game
    food = free[Math.floor(Math.random() * free.length)];
  }

  function initSnake() {
    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);
    snake = [
      { x: cx,     y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
  }

  function getInterval() {
    // Slightly speed up every 50 points, minimum 60 ms
    return Math.max(60, BASE_INTERVAL - Math.floor(score / 50) * 10);
  }

  // ── Game loop ────────────────────────────────────────────────────────────────
  function startGame() {
    clearInterval(intervalId);
    initSnake();
    setScore(0);
    spawnFood();
    state = STATE.PLAYING;
    hintEl.textContent = '';
    scheduleLoop();
    render();
  }

  function scheduleLoop() {
    clearInterval(intervalId);
    intervalId = setInterval(tick, getInterval());
  }

  function tick() {
    dir = { ...nextDir };

    // Move head
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
      endGame();
      return;
    }

    // Self collision (skip tail tip – it will move away)
    for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        endGame();
        return;
      }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(score + 10);
      spawnFood();
      // Re-schedule with potentially updated speed
      scheduleLoop();
    } else {
      snake.pop();
    }

    render();
  }

  function endGame() {
    clearInterval(intervalId);
    state = STATE.GAME_OVER;
    render();
    hintEl.textContent = 'Press Enter or Space to Restart';
  }

  // ── Rendering ────────────────────────────────────────────────────────────────
  function render() {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    if (state !== STATE.IDLE) {
      drawFood();
      drawSnake();
    }

    if (state === STATE.IDLE)      drawIdleOverlay();
    if (state === STATE.GAME_OVER) drawGameOverOverlay();
  }

  function drawGrid() {
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(canvas.width, y * CELL);
      ctx.stroke();
    }
  }

  function drawSnake() {
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? COLOR_HEAD : COLOR_SNAKE;
      const pad = 1;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL + pad,
        seg.y * CELL + pad,
        CELL - pad * 2,
        CELL - pad * 2,
        3
      );
      ctx.fill();
    });
  }

  function drawFood() {
    const r = CELL / 2 - 2;
    const cx = food.x * CELL + CELL / 2;
    const cy = food.y * CELL + CELL / 2;

    // Glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 4);
    grad.addColorStop(0, 'rgba(244,67,54,0.5)');
    grad.addColorStop(1, 'rgba(244,67,54,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLOR_FOOD;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawIdleScreen() {
    render();
  }

  function drawIdleOverlay() {
    ctx.fillStyle = COLOR_OVERLAY;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';

    ctx.font = 'bold 28px Segoe UI, sans-serif';
    ctx.fillStyle = COLOR_SNAKE;
    ctx.fillText('🐍 Snake Game', canvas.width / 2, canvas.height / 2 - 30);

    ctx.font = '16px Segoe UI, sans-serif';
    ctx.fillStyle = COLOR_SUBTEXT;
    ctx.fillText('Press Enter or Space to Start', canvas.width / 2, canvas.height / 2 + 10);

    ctx.font = '13px Segoe UI, sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText('Arrow Keys / WASD to move', canvas.width / 2, canvas.height / 2 + 38);
  }

  function drawGameOverOverlay() {
    ctx.fillStyle = COLOR_OVERLAY;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';

    ctx.font = 'bold 32px Segoe UI, sans-serif';
    ctx.fillStyle = '#f44336';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '20px Segoe UI, sans-serif';
    ctx.fillStyle = COLOR_TEXT;
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);

    if (score === highScore && score > 0) {
      ctx.font = 'bold 15px Segoe UI, sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText('🏆 New High Score!', canvas.width / 2, canvas.height / 2 + 28);
    }

    ctx.font = '14px Segoe UI, sans-serif';
    ctx.fillStyle = COLOR_SUBTEXT;
    ctx.fillText('Press Enter or Space to Restart', canvas.width / 2, canvas.height / 2 + 60);
  }

  // ── Input ────────────────────────────────────────────────────────────────────
  const KEY_DIRS = {
    ArrowUp:    { x:  0, y: -1 },
    ArrowDown:  { x:  0, y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x:  1, y:  0 },
    w: { x:  0, y: -1 },
    s: { x:  0, y:  1 },
    a: { x: -1, y:  0 },
    d: { x:  1, y:  0 },
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (state === STATE.IDLE || state === STATE.GAME_OVER) {
        startGame();
      }
      return;
    }

    if (state !== STATE.PLAYING) return;

    const newDir = KEY_DIRS[e.key];
    if (!newDir) return;
    e.preventDefault();

    // Prevent 180° reversal
    if (newDir.x === -dir.x && newDir.y === -dir.y) return;
    nextDir = newDir;
  });

  // Touch / on-screen buttons
  function bindButton(id, dirObj) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const handler = e => {
      e.preventDefault();
      if (state === STATE.IDLE || state === STATE.GAME_OVER) {
        startGame();
        return;
      }
      if (dirObj.x === -dir.x && dirObj.y === -dir.y) return;
      nextDir = { ...dirObj };
    };
    btn.addEventListener('touchstart', handler, { passive: false });
    btn.addEventListener('mousedown', handler);
  }

  bindButton('btn-up',    { x:  0, y: -1 });
  bindButton('btn-down',  { x:  0, y:  1 });
  bindButton('btn-left',  { x: -1, y:  0 });
  bindButton('btn-right', { x:  1, y:  0 });
})();
