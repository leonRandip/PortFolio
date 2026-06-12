import React from 'react';

const GIF = {
  idle:    '/images/miss_minutes_smiling.gif',
  walk:    '/images/miss_minutes_walking.gif',
  show:    '/images/miss_minutes_showing.gif',
  eyeroll: '/images/miss_minutes_eyeroll.gif',
};

function pickGif(expression, isWalking, isHovered) {
  if (isWalking) return GIF.walk;
  if (isHovered) return GIF.show;
  if (expression === 'angry' || expression === 'suspicious') return GIF.eyeroll;
  if (expression === 'happy' || expression === 'laugh' || expression === 'excited' || expression === 'surprised') return GIF.show;
  return GIF.idle;
}

export default function MissMinutes3D({ expression, isHovered, isWalking, isFlying, walkDir }) {
  const src   = pickGif(expression, isWalking, isHovered);
  const flipX = isWalking && walkDir === 'left';

  return (
    <img
      src={src}
      alt="Miss Minutes"
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        transform: flipX ? 'scaleX(-1)' : 'none',
        display: 'block',
        userSelect: 'none',
        filter: isFlying ? 'drop-shadow(0 0 12px rgba(255,140,0,0.7))' : 'drop-shadow(0 0 6px rgba(255,140,0,0.4))',
      }}
    />
  );
}
