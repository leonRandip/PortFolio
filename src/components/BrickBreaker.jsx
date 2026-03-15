import React, { useEffect, useRef } from 'react';

const COLS = 8;
const ROWS = 5;
const BRICK_H = 22;
const BRICK_GAP = 4;
const PADDLE_W = 130;
const PADDLE_H = 10;
const BALL_R = 7;
const INIT_SPEED = 4.5;
const ROW_COLORS = ['#ff4444', '#ff9900', '#ffdd00', '#00ff41', '#00ccff'];
const ROW_POINTS = [50, 40, 30, 20, 10];

function makeBricks(cw) {
  const bricks = [];
  const totalW = cw - 40;
  const brickW = (totalW - (COLS - 1) * BRICK_GAP) / COLS;
  const offsetX = 20;
  const offsetY = 60;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: offsetX + c * (brickW + BRICK_GAP),
        y: offsetY + r * (BRICK_H + BRICK_GAP),
        w: brickW,
        h: BRICK_H,
        alive: true,
        color: ROW_COLORS[r],
        points: ROW_POINTS[r],
      });
    }
  }
  return bricks;
}

export default function BrickBreaker({ onClose }) {
  const canvasRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const cw = canvas.width;
    const ch = canvas.height;

    // Game state in plain refs for RAF performance
    let score = 0;
    let lives = 3;
    let level = 1;
    let bricks = makeBricks(cw);
    let brickW = bricks[0]?.w ?? 60;

    let paddleX = cw / 2 - PADDLE_W / 2;
    let ballX = cw / 2;
    let ballY = ch - 120;
    let ballSpeedX = INIT_SPEED * (Math.random() > 0.5 ? 1 : -1);
    let ballSpeedY = -INIT_SPEED;

    let gameOver = false;
    let levelClear = false;
    let levelClearTimer = 0;
    let keys = { left: false, right: false };

    const PADDLE_Y = ch - 60;

    // Keyboard
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { onCloseRef.current(`Game over. Final score: ${score}`); return; }
      if (e.key === 'ArrowLeft')  keys.left  = true;
      if (e.key === 'ArrowRight') keys.right = true;
      if ((gameOver || levelClear) && e.key !== 'Escape') {
        if (gameOver) {
          score = 0; lives = 3; level = 1;
          bricks = makeBricks(cw);
          ballX = cw / 2; ballY = ch - 120;
          ballSpeedX = INIT_SPEED * (Math.random() > 0.5 ? 1 : -1);
          ballSpeedY = -INIT_SPEED;
          gameOver = false;
        }
        levelClear = false;
      }
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft')  keys.left  = false;
      if (e.key === 'ArrowRight') keys.right = false;
    };
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      paddleX = e.clientX - rect.left - PADDLE_W / 2;
      paddleX = Math.max(0, Math.min(cw - PADDLE_W, paddleX));
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousemove', onMouseMove);

    function resetBall() {
      ballX = cw / 2;
      ballY = ch - 120;
      ballSpeedX = INIT_SPEED * (Math.random() > 0.5 ? 1 : -1);
      ballSpeedY = -INIT_SPEED;
    }

    let rafId;
    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);

      if (gameOver) {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 2rem "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', cw / 2, ch / 2 - 20);
        ctx.fillStyle = '#00ff41';
        ctx.font = '1rem "JetBrains Mono", monospace';
        ctx.fillText(`Final Score: ${score}`, cw / 2, ch / 2 + 20);
        ctx.fillStyle = 'rgba(0,255,65,0.45)';
        ctx.font = '0.8rem "JetBrains Mono", monospace';
        ctx.fillText('Press any key to restart  |  Esc to exit', cw / 2, ch / 2 + 55);
        rafId = requestAnimationFrame(draw);
        return;
      }

      if (levelClear) {
        levelClearTimer++;
        ctx.fillStyle = '#00ff41';
        ctx.font = 'bold 2rem "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL CLEAR!', cw / 2, ch / 2);
        ctx.font = '0.9rem "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(0,255,65,0.5)';
        ctx.fillText('Press any key to continue', cw / 2, ch / 2 + 40);
        if (levelClearTimer > 90) {
          level++;
          bricks = makeBricks(cw);
          brickW = bricks[0]?.w ?? 60;
          const speed = INIT_SPEED + (level - 1) * 0.6;
          ballSpeedX = speed * (Math.random() > 0.5 ? 1 : -1);
          ballSpeedY = -speed;
          levelClear = false;
          levelClearTimer = 0;
        }
        rafId = requestAnimationFrame(draw);
        return;
      }

      // Paddle movement via keyboard
      if (keys.left)  paddleX = Math.max(0, paddleX - 10);
      if (keys.right) paddleX = Math.min(cw - PADDLE_W, paddleX + 10);

      // Ball physics
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Wall bounce
      if (ballX - BALL_R < 0)  { ballX = BALL_R; ballSpeedX = Math.abs(ballSpeedX); }
      if (ballX + BALL_R > cw) { ballX = cw - BALL_R; ballSpeedX = -Math.abs(ballSpeedX); }
      if (ballY - BALL_R < 0)  { ballY = BALL_R; ballSpeedY = Math.abs(ballSpeedY); }

      // Paddle collision
      if (
        ballY + BALL_R >= PADDLE_Y &&
        ballY + BALL_R <= PADDLE_Y + PADDLE_H + Math.abs(ballSpeedY) &&
        ballX >= paddleX &&
        ballX <= paddleX + PADDLE_W
      ) {
        ballSpeedY = -Math.abs(ballSpeedY);
        // Angle based on where it hit
        const hitPos = (ballX - paddleX) / PADDLE_W - 0.5; // -0.5 to 0.5
        const speed = Math.sqrt(ballSpeedX ** 2 + ballSpeedY ** 2);
        ballSpeedX = speed * hitPos * 2;
        // Clamp horizontal speed
        ballSpeedX = Math.max(-speed * 0.95, Math.min(speed * 0.95, ballSpeedX));
        ballY = PADDLE_Y - BALL_R - 1;
      }

      // Ball falls below paddle
      if (ballY - BALL_R > ch) {
        lives--;
        if (lives <= 0) { gameOver = true; }
        else { resetBall(); }
      }

      // Brick collisions
      for (const b of bricks) {
        if (!b.alive) continue;
        if (
          ballX + BALL_R > b.x &&
          ballX - BALL_R < b.x + b.w &&
          ballY + BALL_R > b.y &&
          ballY - BALL_R < b.y + b.h
        ) {
          b.alive = false;
          score += b.points;
          // Determine bounce direction
          const overlapLeft   = ballX + BALL_R - b.x;
          const overlapRight  = b.x + b.w - (ballX - BALL_R);
          const overlapTop    = ballY + BALL_R - b.y;
          const overlapBottom = b.y + b.h - (ballY - BALL_R);
          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
          if (minOverlap === overlapTop || minOverlap === overlapBottom) {
            ballSpeedY = -ballSpeedY;
          } else {
            ballSpeedX = -ballSpeedX;
          }
          break;
        }
      }

      // Level clear check
      if (bricks.every(b => !b.alive)) { levelClear = true; }

      // Draw bricks
      for (const b of bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
      }

      // Draw paddle
      ctx.fillStyle = '#00ff41';
      ctx.shadowColor = 'rgba(0,255,65,0.5)';
      ctx.shadowBlur = 8;
      ctx.fillRect(paddleX, PADDLE_Y, PADDLE_W, PADDLE_H);
      ctx.shadowBlur = 0;

      // Draw ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(255,255,255,0.6)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // HUD
      ctx.fillStyle = '#00ff41';
      ctx.font = '0.78rem "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${String(score).padStart(4, '0')}`, 20, 30);
      ctx.textAlign = 'center';
      ctx.fillText(`LEVEL ${level}`, cw / 2, 30);
      ctx.textAlign = 'right';
      ctx.fillText('LIVES: ' + '♥'.repeat(lives), cw - 20, 30);

      // Esc hint
      ctx.fillStyle = 'rgba(0,255,65,0.25)';
      ctx.font = '0.65rem "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Esc to exit', cw / 2, ch - 15);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'block', cursor: 'none' }}
    />
  );
}
