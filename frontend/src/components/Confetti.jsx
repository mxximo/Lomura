import { createPortal } from "react-dom";

const confettiPieces = Array.from({ length: 68 }, (_, index) => ({
  id: index,
  x: (index * 37) % 100,
  drift: ((index * 29) % 190) - 95,
  delay: (index % 11) * 55,
  duration: 2100 + (index % 6) * 120,
  color: ["#6c55b3", "#779c7e", "#c79062", "#a95f88"][index % 4],
}));

export default function ConfettiBurst() {
  return createPortal(
    <div className="confetti-overlay" aria-hidden="true">
      {confettiPieces.map((piece) => (
        <span
          key={piece.id}
          style={{
            "--confetti-x": `${piece.x}%`,
            "--confetti-drift": `${piece.drift}px`,
            "--confetti-delay": `${piece.delay}ms`,
            "--confetti-duration": `${piece.duration}ms`,
            "--confetti-color": piece.color,
          }}
        />
      ))}
    </div>,
    document.body,
  );
}
