import React, { useState, useEffect, useRef } from 'react';

const PAD = (s, n) => String(s).padStart(n);

function fmtTime() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
}

const BASE_PROCS = [
  { pid: 1337, user: 'randip', cpu: 94.2, mem: 8.1, time: '42:00.00', cmd: 'overthinking.exe' },
  { pid:  420, user: 'randip', cpu:  3.1, mem: 2.4, time: '1:30.12',  cmd: 'react-devtools'   },
  { pid:  316, user: 'randip', cpu:  1.4, mem: 1.1, time: '0:45.33',  cmd: 'vscode'           },
  { pid:   42, user: 'randip', cpu:  0.8, mem: 0.5, time: '0:12.44',  cmd: 'coffee-daemon'    },
  { pid:  777, user: 'randip', cpu:  0.3, mem: 0.2, time: '0:05.11',  cmd: 'spotify'          },
  { pid:    1, user: 'randip', cpu:  0.1, mem: 0.1, time: '0:00.44',  cmd: 'zsh'              },
  { pid:   99, user: 'randip', cpu:  0.0, mem: 0.0, time: '0:00.01',  cmd: '[kworker]'        },
];

const overlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: '#000',
  fontFamily: '"JetBrains Mono", "Courier New", monospace',
  color: '#00ff41',
  fontSize: '0.82rem',
  padding: '1.5rem 2rem',
  overflow: 'hidden',
};

export default function TopProcess({ onClose }) {
  const [tick, setTick] = useState(0);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, []);

  // Jitter overthinking.exe ±2%
  const jitter = ((tick * 1.618) % 4) - 2;
  const procs = BASE_PROCS.map((p, i) =>
    i === 0 ? { ...p, cpu: Math.max(88, Math.min(99, p.cpu + jitter)).toFixed(1) } : p
  );

  const totalCpu = procs.reduce((s, p) => s + parseFloat(p.cpu), 0);
  const idleCpu = Math.max(0, 100 - totalCpu).toFixed(1);

  return (
    <div style={overlay}>
      <div style={{ marginBottom: '0.6rem', color: '#00ff41' }}>
        {`top - ${fmtTime()}  up 3d 4h 12m,  1 user,  load average: 0.42, 1.33, 2.71`}
      </div>
      <div>{`Tasks: ${procs.length} total,  1 running, ${procs.length - 1} sleeping`}</div>
      <div>{`%Cpu(s): ${procs[0].cpu} us,  2.1 sy,  0.0 ni,  ${idleCpu} id`}</div>
      <div>{'MiB Mem:  16384.0 total,  8192.0 free,  4096.0 used'}</div>
      <div style={{ marginBottom: '1rem' }}>{'MiB Swap:  2048.0 total,  2048.0 free,     0.0 used'}</div>

      <div style={{ color: '#ffb800', marginBottom: '0.4rem' }}>
        {'  PID  USER      CPU%  MEM%   TIME+      COMMAND'}
      </div>

      {procs.map((p) => (
        <div key={p.pid} style={{ color: p.pid === 1337 ? '#ff4444' : '#00ff41' }}>
          {`${PAD(p.pid, 5)}  ${p.user.padEnd(8)}  ${String(p.cpu).padStart(5)}  ${String(p.mem).padStart(4)}   ${p.time.padEnd(10)} ${p.cmd}`}
        </div>
      ))}

      <div style={{ marginTop: '1.5rem', color: 'rgba(0,255,65,0.4)', fontSize: '0.72rem' }}>
        Press &apos;q&apos; or Esc to quit
      </div>
    </div>
  );
}
