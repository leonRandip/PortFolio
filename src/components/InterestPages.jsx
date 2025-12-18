import React from 'react';

export function MyWorld() {
  return (
    <section className="hidden md:flex relative w-full h-screen bg-black text-white overflow-hidden snap-start flex-col items-center justify-center">
      <div className="text-center z-10">
        <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter mb-4">
          My Interests
        </h1>
        <p className="text-sm md:text-base text-gray-400 tracking-widest uppercase">
          A Curation of Passions
        </p>
      </div>
      <div className="absolute bottom-10 animate-bounce">
        <span className="text-gray-500 text-xl">↓</span>
      </div>
    </section>
  );
}

export function TechMusic() {
  return (
    <section className="hidden md:block relative w-full h-screen bg-black text-white overflow-hidden snap-start p-8 md:p-16">
      {/* Tech Trends - Top Left */}
      <div className="absolute top-16 left-8 md:left-16 max-w-lg">
        <h2 className="text-4xl md:text-6xl font-bold uppercase mb-4 tracking-tighter">
          Tech Trends
        </h2>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">
          Exploring the bleeding edge of software, hardware, and the digital frontier. From AI agents to quantum leaps.
        </p>
      </div>

      {/* Music - Bottom Right */}
      <div className="absolute bottom-16 right-8 md:right-16 max-w-lg text-right flex flex-col items-end">
        <h2 className="text-4xl md:text-6xl font-bold uppercase mb-4 tracking-tighter">
          Music
        </h2>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">
          Rhythm is the soul of life. Curating soundscapes that move the mind and body.
        </p>
      </div>
    </section>
  );
}

export function Mma() {
  return (
    <section className="hidden md:flex relative w-full h-screen bg-black text-white overflow-hidden snap-start p-8 md:p-16 items-center justify-center">
      {/* MMA - Centered */}
      <div className="max-w-lg text-center">
        <h2 className="text-4xl md:text-6xl font-bold uppercase mb-4 tracking-tighter">
          MMA
        </h2>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">
          Precision beats power. Timing beats speed. The art of combat in its purest form.
        </p>
      </div>
    </section>
  );
}

export function CryptoChess() {
  return (
    <section className="hidden md:block relative w-full h-screen bg-black text-white overflow-hidden snap-start p-8 md:p-16">
      {/* Crypto Mining - Top Right */}
      <div className="absolute top-16 right-8 md:right-16 max-w-lg text-right flex flex-col items-end">
        <h2 className="text-4xl md:text-6xl font-bold uppercase mb-4 tracking-tighter">
          Crypto Mining
        </h2>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">
          Decentralized consensus and the mechanics of the blockchain. Powering the future of finance, one hash at a time.
        </p>
      </div>

      {/* Chess - Bottom Left */}
      <div className="absolute bottom-16 left-8 md:left-16 max-w-lg">
        <h2 className="text-4xl md:text-6xl font-bold uppercase mb-4 tracking-tighter">
          Chess
        </h2>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed">
          The ultimate game of strategy. 64 squares, infinite possibilities. Precision beats power.
        </p>
      </div>
    </section>
  );
}

export function InterestsGrid() {
  const interests = [
    "TECH TRENDS",
    "MUSIC",
    "MMA",
    "CRYPTO MINING",
    "CHESS",
    "DEVELOPMENT",
    "UI DESIGN",
    "AI AGENTS",
  ];

  return (
    <section className="relative w-full min-h-screen bg-black text-white overflow-hidden snap-start flex flex-col items-center justify-center p-4 md:p-8">
      <div className="text-center mb-8 md:mb-16 z-10">
        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-white mb-2">
          WHAT I LOVE.
        </h2>
        <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-gray-600">
          INTERESTS.
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-7xl px-4 md:px-0 z-10">
        {interests.map((interest) => (
          <div
            key={interest}
            className="group relative h-24 md:h-32 border border-gray-800 rounded-lg 
                     hover:bg-gray-800 transition-all duration-300 cursor-pointer
                     flex items-center justify-center text-center bg-black/50 backdrop-blur-sm"
          >
            <span className="font-bold tracking-widest text-xs md:text-sm text-gray-200 group-hover:text-white transition-colors">
              {interest}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
