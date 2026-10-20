const lineas = [
  'M0,400 C200,300 400,500 600,380 S1000,250 1200,330',
  'M0,450 C250,350 450,520 700,420 S1050,300 1200,380',
  'M0,350 C180,420 420,260 640,340 S1000,430 1200,300',
  'M0,300 C220,240 460,380 700,300 S1040,200 1200,260',
]

export default function LineasFondo() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-70"
      viewBox="0 0 1200 600"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="lg-fondo" x1="0" x2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      {lineas.map((d, k) => (
        <g key={k}>
          <path d={d} fill="none" stroke="url(#lg-fondo)" strokeOpacity="0.2" strokeWidth="1.5"
            vectorEffect="non-scaling-stroke" />
          <path d={d} pathLength={1500} fill="none" stroke="url(#lg-fondo)" strokeWidth="2.5"
            vectorEffect="non-scaling-stroke" className="linea-fondo"
            style={{ animationDelay: `${k * -2}s`, filter: 'drop-shadow(0 0 6px rgba(139,92,246,.9))' }} />
        </g>
      ))}
    </svg>
  )
}