import { useEffect, useRef } from 'react';

const FONT_SIZE = 14;
const KATAKANA_START = 0x30a0;
const KATAKANA_END   = 0x30ff;
const DIGITS = '0123456789';

function randomChar() {
  if (Math.random() < 0.3) {
    return DIGITS[Math.floor(Math.random() * DIGITS.length)];
  }
  const code = KATAKANA_START + Math.floor(Math.random() * (KATAKANA_END - KATAKANA_START));
  return String.fromCharCode(code);
}

export default function MatrixCanvas({ onExit }) {
  const canvasRef = useRef(null);
  // Keep onExit stable in a ref so the keydown listener never needs re-registration
  const onExitRef = useRef(onExit);
  useEffect(() => { onExitRef.current = onExit; }, [onExit]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animFrameId;
    let drops, speeds, streamLengths, charAtTop, columns;

    const init = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      columns       = Math.floor(canvas.width / FONT_SIZE);

      drops         = new Float32Array(columns);
      speeds        = new Float32Array(columns);
      streamLengths = new Int16Array(columns);
      charAtTop     = new Uint8Array(columns); // tracks "frames since stream started"

      for (let i = 0; i < columns; i++) {
        // Stagger start so streams don't all begin at top simultaneously
        drops[i]         = -(Math.random() * (canvas.height / FONT_SIZE));
        speeds[i]         = 0.4 + Math.random() * 1.1;
        streamLengths[i]  = 10 + Math.floor(Math.random() * 22);
        charAtTop[i]      = 0;
      }
    };

    const draw = () => {
      // Semi-transparent black fill creates the trailing fade
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;

      for (let col = 0; col < columns; col++) {
        const y = drops[col] * FONT_SIZE;
        if (y < 0) {
          drops[col] += speeds[col];
          continue;
        }

        const x = col * FONT_SIZE;

        // Head character — bright white
        ctx.fillStyle = '#ffffff';
        ctx.fillText(randomChar(), x, y);

        // Body characters above (draw a few for the stream body)
        ctx.fillStyle = '#00ff41';
        for (let row = 1; row < Math.min(streamLengths[col], Math.floor(drops[col])); row++) {
          const bodyY = (drops[col] - row) * FONT_SIZE;
          if (bodyY < 0) break;
          // Fade out older chars
          const alpha = 1 - row / streamLengths[col];
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillText(randomChar(), x, bodyY);
        }
        ctx.globalAlpha = 1;

        drops[col] += speeds[col];

        // Reset when stream goes off-screen
        if (drops[col] * FONT_SIZE > canvas.height && Math.random() > 0.97) {
          drops[col]        = -(Math.random() * 20);
          streamLengths[col] = 10 + Math.floor(Math.random() * 22);
          speeds[col]        = 0.4 + Math.random() * 1.1;
        }
      }

      animFrameId = requestAnimationFrame(draw);
    };

    init();
    animFrameId = requestAnimationFrame(draw);

    const handleResize = () => { init(); };
    const handleKey    = () => { onExitRef.current?.(); };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKey);
    };
  }, []); // runs once; onExit accessed via ref

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'block',
      }}
    />
  );
}
