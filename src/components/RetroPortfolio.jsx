import React, { useState, useEffect } from 'react';

const PROJECTS = [
  { title: 'Quiz App',              tech: 'HTML, CSS, JAVASCRIPT',    url: 'https://leonrandip.github.io/Quiz-Site/' },
  { title: 'Personalised Chatbot',  tech: 'HTML, CSS, JAVASCRIPT',    url: 'https://personalised-chatbot.vercel.app' },
  { title: 'Ded-Lift',              tech: 'MERN STACK',               url: 'https://ded-lift.vercel.app/' },
  { title: 'SoulStitch',            tech: 'REACT',                    url: 'https://soul-stitch.vercel.app/' },
  { title: 'ScrollR3F',             tech: 'REACT, REACT THREE FIBER', url: 'https://scroll-r3f.vercel.app' },
  { title: 'Parkinsons Detection',  tech: 'PYTHON, FLASK',            url: 'https://parkinsonsdetection.up.railway.app/' },
];

const SKILLS = ['EXPRESSJS','MONGODB','SQL','HTML5','CSS3','JAVASCRIPT','REACTJS','NODEJS','POSTGRESQL','REDUX'];

const ASCII_ART = `
 ____  ___   _  _ ____  _  ____     __    ____  __  _  _
(  _ \\/ _ \\ ( \\( (  _ \\(_)(  _ \\   (  )  ( ___)/  \\( \\( )
 )   / (_) ) )  ( )(_) ))  ) __/    )(__  )__) ( () ))  (
(_)\\_)\\___/ (_)\\_)(____/(__)(__)   (____)(____) \\__/(_)\\_)
`;

const TABS = ['ABOUT', 'PROJECTS', 'SKILLS', 'CONTACT'];

export default function RetroPortfolio({ onExit }) {
  const [activeTab, setActiveTab] = useState('ABOUT');
  const [counter, setCounter] = useState(0);

  // Inject CSS keyframes for blink + marquee
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'retro-styles';
    style.textContent = `
      @keyframes retroBlink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes retroMarquee { 0%{transform:translateX(100vw)} 100%{transform:translateX(-100%)} }
      .retro-blink { animation: retroBlink 1s step-end infinite; }
      .retro-marquee-inner { display:inline-block; animation: retroMarquee 18s linear infinite; white-space:nowrap; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById('retro-styles')?.remove();
  }, []);

  // Animate hit counter to real visitor count (or 1337 fallback)
  useEffect(() => {
    const animateTo = (target) => {
      let val = 0;
      const step = Math.max(1, Math.floor(target / 44));
      const interval = setInterval(() => {
        val = Math.min(val + step, target);
        setCounter(val);
        if (val >= target) clearInterval(interval);
      }, 28);
      return () => clearInterval(interval);
    };

    let cleanup;
    fetch('https://counterapi.dev/api/randipleon.vercel.app/visits/hit')
      .then(r => r.json())
      .then(data => { cleanup = animateTo(data.count || 1337); })
      .catch(() => { cleanup = animateTo(1337); });

    return () => cleanup?.();
  }, []);

  const base = {
    background: '#000d00',
    color: '#00ff41',
    fontFamily: '"Courier New", Courier, monospace',
    minHeight: '100vh',
    overflowY: 'auto',
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    fontSize: '0.85rem',
    lineHeight: 1.6,
  };

  const box = (extra = {}) => ({
    border: '2px solid #00ff41',
    padding: '1rem 1.25rem',
    marginBottom: '1rem',
    ...extra,
  });

  return (
    <div style={base}>
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: '#001100',
        borderBottom: '3px solid #00ff41',
        padding: '0.6rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <button
          onClick={onExit}
          style={{
            background: 'transparent',
            border: '2px solid #ff4444',
            color: '#ff4444',
            fontFamily: 'inherit',
            fontSize: '0.75rem',
            padding: '0.2rem 0.6rem',
            cursor: 'pointer',
            letterSpacing: '0.08em',
          }}
        >
          [DISCONNECT]
        </button>

        <pre style={{ margin: 0, fontSize: '0.38rem', lineHeight: 1.3, color: '#00ff41', textAlign: 'center' }}>
          {ASCII_ART}
        </pre>

        <span style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
          <span className="retro-blink" style={{ color: '#00ff41' }}>◉</span>{' '}
          <span style={{ color: '#33ff66' }}>ONLINE</span>
        </span>
      </div>

      {/* ── Hit counter ───────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '1.25rem 1rem 0.5rem', borderBottom: '1px solid #003300' }}>
        <div style={{
          fontSize: '0.65rem',
          letterSpacing: '0.2em',
          color: '#006600',
          marginBottom: '0.2rem',
          textTransform: 'uppercase',
        }}>
          You are visitor
        </div>
        <div style={{
          fontSize: '2.8rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textShadow: '0 0 20px #00ff41, 0 0 40px #00aa2288',
          fontVariantNumeric: 'tabular-nums',
        }}>
          #{String(counter).padStart(6, '0')}
        </div>
      </div>

      {/* ── Nav tabs ──────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 0,
        padding: '1rem 1rem 0',
        borderBottom: '2px solid #00ff41',
      }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: 'inherit',
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
              padding: '0.3rem 1rem',
              background: activeTab === tab ? '#00ff41' : 'transparent',
              color: activeTab === tab ? '#000' : '#00ff41',
              border: '2px solid #00ff41',
              borderBottom: activeTab === tab ? '2px solid #000d00' : '2px solid #00ff41',
              marginBottom: activeTab === tab ? '-2px' : 0,
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 700 : 400,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: '1.25rem 1rem 2rem', maxWidth: 900, margin: '0 auto' }}>

        {activeTab === 'ABOUT' && (
          <div style={box()}>
            <p style={{ marginTop: 0 }}>
              &gt; <strong>NAME:</strong> Maria Randip Leon<br />
              &gt; <strong>ROLE:</strong> Frontend Developer Intern @ <span style={{ color: '#66ffaa' }}>yavar.ai</span> <span style={{ color: '#888' }}>[ACTIVE]</span><br />
              &gt; <strong>ALSO:</strong> Full-Stack Web Developer<br />
              &gt; <strong>STACK:</strong> React · Node.js · Express · MongoDB · PostgreSQL<br />
              &gt; <strong>COLLEGE:</strong> Karpagam College of Engineering (B.Tech IT, 2021–2025)<br />
              &gt; <strong>INTERN:</strong> Prime Solutions (2023) — Built MERN Task Manager<br />
            </p>
            <p style={{ marginBottom: 0 }}>
              Build scalable full-stack applications · Integrate real-time features and APIs ·
              Design clean, responsive UIs · Always exploring the latest in tech.
              <span className="retro-blink"> █</span>
            </p>
          </div>
        )}

        {activeTab === 'PROJECTS' && (
          <div style={box()}>
            <div style={{ marginBottom: '0.5rem', color: '#006600', letterSpacing: '0.1em' }}>
              -- 6 PROJECTS FOUND --
            </div>
            {PROJECTS.map(({ title, tech, url }) => (
              <div key={title} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px dashed #003300' }}>
                &gt;{' '}
                <strong style={{ color: '#66ffaa' }}>{title}</strong>
                {'  '}
                <span style={{ color: '#888' }}>|</span>
                {'  '}
                <span style={{ color: '#aaffcc', fontSize: '0.75rem' }}>{tech}</span>
                {'  '}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#00ffff', textDecoration: 'underline', fontSize: '0.75rem' }}
                >
                  [VIEW ↗]
                </a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SKILLS' && (
          <div style={box()}>
            <div style={{ marginBottom: '0.75rem', color: '#006600', letterSpacing: '0.1em' }}>
              -- TECH STACK --
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SKILLS.map(skill => (
                <span
                  key={skill}
                  style={{
                    border: '1px solid #00ff41',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    color: '#00ff41',
                    background: 'rgba(0,255,65,0.04)',
                  }}
                >
                  [{skill}]
                </span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'CONTACT' && (
          <div style={box()}>
            <p>&gt; <strong>EMAIL</strong></p>
            <p style={{ marginLeft: '1rem' }}>
              <a href="mailto:leonrandip@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>
                leonrandip@gmail.com
              </a>
            </p>
            <p>&gt; <strong>LINKEDIN</strong></p>
            <p style={{ marginLeft: '1rem' }}>
              <a href="https://www.linkedin.com/in/leonrandip/" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>
                linkedin.com/in/leonrandip
              </a>
            </p>
            <p>&gt; <strong>GITHUB</strong></p>
            <p style={{ marginLeft: '1rem', marginBottom: 0 }}>
              <a href="https://github.com/leonRandip" target="_blank" rel="noopener noreferrer" style={{ color: '#00ffff' }}>
                github.com/leonRandip
              </a>
            </p>
          </div>
        )}
      </div>

      {/* ── Marquee ───────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#001100',
        borderTop: '1px solid #003300',
        overflow: 'hidden',
        height: '1.6rem',
        display: 'flex',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <span
          className="retro-marquee-inner"
          style={{ color: '#00aa33', fontSize: '0.7rem', letterSpacing: '0.12em' }}
        >
          {'*** CURRENTLY @ YAVAR.AI — FRONTEND DEV INTERN *** REACT · NODE.JS · EXPRESS · MONGODB *** OPEN AFTER INTERNSHIP CONCLUDES *** BUILD · SHIP · REPEAT ***'}
        </span>
      </div>
    </div>
  );
}
