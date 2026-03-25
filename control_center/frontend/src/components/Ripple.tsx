interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}

export default function Ripple({
  mainCircleSize = 180,
  mainCircleOpacity = 0.3,
  numCircles = 7,
}: RippleProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      {Array.from({ length: numCircles }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-indigo-400/20 animate-ripple"
          style={{
            width: mainCircleSize + i * 80,
            height: mainCircleSize + i * 80,
            opacity: Math.max(mainCircleOpacity - i * 0.035, 0),
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </div>
  )
}
