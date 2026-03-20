// ─────────────────────────────────────────────────────────────────────────────
// Procedural sound engine — no audio files, pure Web Audio API
// All sounds generated programmatically to keep bundle small and avoid
// autoplay policy issues (context is initialized on first user gesture).
// ─────────────────────────────────────────────────────────────────────────────

let ctx = null;
let masterGain = null;
const loops = new Map();

const enabled = () => localStorage.getItem('sound') === 'on';

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
  }
  // Resume if suspended (needed after page backgrounding)
  if (ctx.state === 'suspended') ctx.resume();
  return { ctx, out: masterGain };
}

function playTone(freq, duration, type = 'sine', vol = 1) {
  if (!enabled()) return;
  const { ctx: c, out } = getCtx();
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  env.gain.setValueAtTime(vol * 0.4, c.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(env);
  env.connect(out);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration + 0.01);
}

function playNoise(duration, vol = 0.08, cutoff = 800) {
  if (!enabled()) return;
  const { ctx: c, out } = getCtx();
  const bufferSize = Math.ceil(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const source = c.createBufferSource();
  source.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = cutoff;
  filter.Q.value = 0.5;
  const env = c.createGain();
  env.gain.setValueAtTime(vol, c.currentTime);
  env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  source.connect(filter);
  filter.connect(env);
  env.connect(out);
  source.start();
  source.stop(c.currentTime + duration + 0.01);
}

const soundEngine = {
  /** Call once on first user gesture to unlock AudioContext eagerly */
  init() {
    if (!enabled()) return;
    getCtx();
  },

  play(name) {
    if (!enabled()) return;
    switch (name) {
      case 'keystroke':
        playNoise(0.007, 0.06, 1200);
        break;
      case 'submit':
        playTone(523, 0.07, 'sine', 0.5);
        break;
      case 'error':
        playTone(160, 0.12, 'sawtooth', 0.35);
        break;
      case 'connect':
        playTone(440, 0.05, 'sine', 0.4);
        setTimeout(() => playTone(660, 0.08, 'sine', 0.4), 70);
        break;
      case 'disconnect':
        playTone(440, 0.05, 'sine', 0.35);
        setTimeout(() => playTone(330, 0.1, 'sine', 0.35), 70);
        break;
      case 'tva-activate':
        playTone(180, 0.1, 'sawtooth', 0.3);
        setTimeout(() => playTone(280, 0.1, 'sine', 0.4), 160);
        setTimeout(() => playTone(480, 0.18, 'sine', 0.5), 320);
        break;
      case 'hire-beep':
        playTone(880, 0.05, 'sine', 0.5);
        setTimeout(() => playTone(660, 0.05, 'sine', 0.5), 80);
        setTimeout(() => playTone(440, 0.12, 'sine', 0.5), 160);
        break;
      case 'peer-join':
        playTone(523, 0.06, 'sine', 0.4);
        setTimeout(() => playTone(659, 0.06, 'sine', 0.4), 80);
        setTimeout(() => playTone(784, 0.12, 'sine', 0.4), 160);
        break;
    }
  },

  loop(name) {
    if (!enabled()) return () => {};
    // Stop existing loop with same name first
    this.stop(name);
    let running = true;

    const schedule = () => {
      if (!running || !enabled()) return;
      if (name === 'matrix-loop') {
        playTone(55 + Math.random() * 15, 0.25, 'sine', 0.04);
        setTimeout(schedule, 280 + Math.random() * 120);
      } else if (name === 'hack-ambient') {
        playTone(180 + Math.random() * 360, 0.08, 'sawtooth', 0.06);
        setTimeout(schedule, 180 + Math.random() * 80);
      } else if (name === 'cpu-fan') {
        playNoise(0.18, 0.025, 300);
        setTimeout(schedule, 200);
      }
    };
    schedule();

    const stopFn = () => { running = false; };
    loops.set(name, stopFn);
    return stopFn;
  },

  stop(name) {
    const fn = loops.get(name);
    if (fn) { fn(); loops.delete(name); }
  },

  setVolume(v) {
    if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
  },

  isEnabled: enabled,
};

export default soundEngine;
