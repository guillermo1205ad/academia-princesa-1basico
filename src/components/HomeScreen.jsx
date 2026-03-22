import { useEffect, useRef, useState } from "react";

const floatingStickers = [
  { id: "st-1", emoji: "🦄", top: "5%", left: "4%", size: "3.1rem", delay: "-0.3s", duration: "7.8s" },
  { id: "st-2", emoji: "👸", top: "8%", left: "19%", size: "2.8rem", delay: "-1.8s", duration: "8.6s" },
  { id: "st-3", emoji: "🪄", top: "10%", left: "32%", size: "2.6rem", delay: "-2.2s", duration: "7.1s" },
  { id: "st-4", emoji: "🧚", top: "7%", left: "48%", size: "2.9rem", delay: "-1.4s", duration: "8.4s" },
  { id: "st-5", emoji: "✨", top: "6%", left: "63%", size: "2.5rem", delay: "-0.6s", duration: "7.5s" },
  { id: "st-6", emoji: "🦋", top: "8%", left: "79%", size: "2.7rem", delay: "-2.8s", duration: "8.9s" },
  { id: "st-7", emoji: "🌈", top: "12%", left: "91%", size: "2.9rem", delay: "-0.8s", duration: "9.1s" },
  { id: "st-8", emoji: "🏰", top: "23%", left: "6%", size: "3rem", delay: "-2.6s", duration: "8.2s" },
  { id: "st-9", emoji: "💎", top: "26%", left: "89%", size: "2.4rem", delay: "-1.1s", duration: "7.7s" },
  { id: "st-10", emoji: "🌸", top: "36%", left: "4%", size: "2.8rem", delay: "-0.9s", duration: "8.3s" },
  { id: "st-11", emoji: "🦄", top: "40%", left: "95%", size: "2.8rem", delay: "-2.9s", duration: "8.7s" },
  { id: "st-12", emoji: "👑", top: "55%", left: "8%", size: "2.8rem", delay: "-1.2s", duration: "7.9s" },
  { id: "st-13", emoji: "🧚", top: "59%", left: "92%", size: "2.9rem", delay: "-2.1s", duration: "8.8s" },
  { id: "st-14", emoji: "💖", top: "73%", left: "4%", size: "2.7rem", delay: "-0.4s", duration: "7.4s" },
  { id: "st-15", emoji: "🪄", top: "79%", left: "16%", size: "2.5rem", delay: "-1.7s", duration: "8.6s" },
  { id: "st-16", emoji: "🧜‍♀️", top: "83%", left: "29%", size: "2.8rem", delay: "-2.3s", duration: "9.2s" },
  { id: "st-17", emoji: "🌷", top: "84%", left: "45%", size: "2.8rem", delay: "-0.6s", duration: "7.2s" },
  { id: "st-18", emoji: "✨", top: "82%", left: "62%", size: "2.4rem", delay: "-1.5s", duration: "8.1s" },
  { id: "st-19", emoji: "🦋", top: "81%", left: "78%", size: "2.7rem", delay: "-2.7s", duration: "8.5s" },
  { id: "st-20", emoji: "👸", top: "74%", left: "91%", size: "2.8rem", delay: "-0.7s", duration: "7.6s" },
];

function HomeScreen({ onStart }) {
  const [poppedStickers, setPoppedStickers] = useState({});
  const respawnTimersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(respawnTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
    };
  }, []);

  function popSticker(stickerId) {
    setPoppedStickers((prev) => {
      if (prev[stickerId]) {
        return prev;
      }

      return { ...prev, [stickerId]: true };
    });

    if (respawnTimersRef.current[stickerId]) {
      clearTimeout(respawnTimersRef.current[stickerId]);
    }

    const respawnDelay = 1100 + Math.floor(Math.random() * 1600);

    respawnTimersRef.current[stickerId] = window.setTimeout(() => {
      setPoppedStickers((prev) => {
        if (!prev[stickerId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[stickerId];
        return next;
      });
      delete respawnTimersRef.current[stickerId];
    }, respawnDelay);
  }

  return (
    <section className="home-screen">
      <div className="home-bubbles" aria-hidden="true">
        {floatingStickers.map((sticker, index) => (
          <span
            key={sticker.id}
            className={`sticker-float sticker-variant-${(index % 3) + 1} ${
              poppedStickers[sticker.id] ? "popped" : ""
            }`}
            style={{
              "--sticker-top": sticker.top,
              "--sticker-left": sticker.left,
              "--sticker-size": sticker.size,
              "--sticker-delay": sticker.delay,
              "--sticker-duration": sticker.duration,
            }}
            title="Haz clic para reventar"
            onClick={() => popSticker(sticker.id)}
          >
            {poppedStickers[sticker.id] ? "💥" : sticker.emoji}
          </span>
        ))}
      </div>

      <div className="home-card">
        <h1>Academia de la Princesa</h1>
        <p className="home-subtitle">Aprender jugando en 1° básico</p>
        <p className="home-description">
          Bienvenida al castillo del aprendizaje. Practica Matemática, Ciencias, Lenguaje, Historia
          e Inglés con juegos cortitos, claros y entretenidos.
        </p>
        <button className="primary-button xl" onClick={onStart}>
          Entrar al castillo
        </button>
      </div>
    </section>
  );
}

export default HomeScreen;
