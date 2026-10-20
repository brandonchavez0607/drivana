'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const slides: { etiqueta: string; titulo: [string, boolean][]; texto: string }[] = [
  {
    etiqueta: 'RENTA DE AUTOS',
    titulo: [['Renta', true], [' el auto que necesitas en ', false], ['Drivana', true]],
    texto: 'Renta autos de forma fácil y segura, y platica directo con el propietario.',
  },
  {
    etiqueta: 'RESERVA FÁCIL',
    titulo: [['Aparta tu auto con solo el ', false], ['20%', true], [' de anticipo', false]],
    texto: 'Elige tus fechas en el calendario, paga tu anticipo y el resto al recoger el auto.',
  },
  {
    etiqueta: 'CHAT EN TIEMPO REAL',
    titulo: [['Habla directo con el ', false], ['propietario', true]],
    texto: 'Resuelve tus dudas al instante antes de rentar, sin salir de la plataforma.',
  },
]

const lineas = [
  'M0,400 C200,300 400,500 600,380 S1000,250 1200,330',
  'M0,450 C250,350 450,520 700,420 S1050,300 1200,380',
  'M0,350 C180,420 420,260 640,340 S1000,430 1200,300',
  'M0,300 C220,240 460,380 700,300 S1040,200 1200,260',
]

const tarjeta =
  'relative rounded-2xl border border-white/15 bg-black p-6 transition duration-300 hover:-translate-y-2 hover:border-purple-400/60 hover:shadow-[0_0_40px_-10px_rgba(109,40,217,0.8)]'

export default function Home() {
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)

  useEffect(() => {
    if (pausa) return
    const t = setTimeout(() => setI((p) => (p + 1) % slides.length), 5000)
    return () => clearTimeout(t)
  }, [i, pausa])

  const anterior = () => setI((p) => (p - 1 + slides.length) % slides.length)
  const siguiente = () => setI((p) => (p + 1) % slides.length)

  return (
    <main className="inicio min-h-screen bg-black overflow-x-hidden">
      <style>{`
        @keyframes fluir { to { stroke-dashoffset: -1500; } }
        @keyframes flotar { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes burbuja {
          0% { opacity: 0; transform: translateY(8px); }
          10%, 85% { opacity: 1; transform: none; }
          100% { opacity: 0; }
        }
        .linea { stroke-dasharray: 220 1280; animation: fluir 8s linear infinite; }
        .flotar { animation: flotar 4s ease-in-out infinite; }
        .burbuja { animation: burbuja 7s infinite both; }
        @media (prefers-reduced-motion: reduce) {
          .linea, .flotar, .burbuja { animation: none; }
        }
      `}</style>

      {/* HERO */}
      <section
        onMouseEnter={() => setPausa(true)}
        onMouseLeave={() => setPausa(false)}
        className="relative overflow-hidden bg-gradient-to-b from-purple-950 to-black pt-20 pb-36"
      >
        {/* Líneas animadas */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lg" x1="0" x2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          {lineas.map((d, k) => (
            <g key={k}>
              <path d={d} fill="none" stroke="url(#lg)" strokeOpacity="0.2" strokeWidth="1.5"
                vectorEffect="non-scaling-stroke" />
              <path d={d} pathLength={1500} fill="none" stroke="url(#lg)" strokeWidth="2.5"
                vectorEffect="non-scaling-stroke" className="linea"
                style={{ animationDelay: `${k * -2}s`, filter: 'drop-shadow(0 0 6px rgba(139,92,246,.9))' }} />
            </g>
          ))}
        </svg>


        {/* Flechas */}
        <button onClick={anterior} aria-label="Anterior"
          className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-white/20 bg-white/5 text-2xl text-white backdrop-blur hover:bg-white/15 transition">
          ‹
        </button>
        <button onClick={siguiente} aria-label="Siguiente"
          className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-white/20 bg-white/5 text-2xl text-white backdrop-blur hover:bg-white/15 transition">
          ›
        </button>

        {/* Diapositivas */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="grid">
            {slides.map((s, n) => (
              <div key={n}
                className={`col-start-1 row-start-1 flex flex-col items-center gap-6 transition-all duration-700 ${
                  n === i
                    ? 'opacity-100 translate-x-0'
                    : `opacity-0 pointer-events-none ${n < i ? '-translate-x-10' : 'translate-x-10'}`
                }`}>
                <span className="text-sm uppercase tracking-widest text-brand-light">{s.etiqueta}</span>
                <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight max-w-3xl">
                  {s.titulo.map(([t, c], k) =>
                    c ? (
                      <span key={k} className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
                        {t}
                      </span>
                    ) : (
                      <span key={k}>{t}</span>
                    )
                  )}
                </h1>
                <p className="text-lg text-neutral-300 max-w-xl">{s.texto}</p>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  <Link href="/autos"
                    className="px-7 py-3 rounded-xl font-semibold text-white bg-brand border border-white/20 shadow-[0_0_25px_rgba(109,40,217,0.6)] hover:shadow-[0_0_45px_rgba(109,40,217,0.95)] hover:-translate-y-0.5 transition">
                    Ver autos
                  </Link>
                  <Link href="/publicar"
                    className="px-7 py-3 rounded-xl font-semibold text-white border border-white/25 bg-white/5 backdrop-blur hover:bg-white/15 hover:-translate-y-0.5 transition">
                    Publicar mi auto
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Puntos */}
          <div className="flex justify-center gap-2 mt-10">
            {slides.map((_, n) => (
              <button key={n} onClick={() => setI(n)} aria-label={`Ir a la diapositiva ${n + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  n === i ? 'w-8 bg-brand-light' : 'w-2 bg-white/30 hover:bg-white/60'
                }`} />
            ))}
          </div>
        </div>
      </section>

      {/* TARJETAS */}
      <section className="relative z-10 max-w-6xl mx-auto -mt-20 px-6 pb-20 grid gap-6 md:grid-cols-3">
        <div className={tarjeta}>
          <div className="flex items-center justify-between text-5xl">
            <span className="flotar">🤝</span>
            <span className="flotar" style={{ animationDelay: '-2s' }}>📍</span>
          </div>
          <h3 className="mt-6 text-lg font-semibold text-brand-light">Publica en minutos</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Sube las fotos de tu auto y listo, sin trámites complicados.
          </p>
        </div>

        <div className={`${tarjeta} border-purple-500/40 shadow-[0_0_40px_-12px_rgba(109,40,217,0.7)]`}>
          <span className="absolute top-4 right-4 flex items-center gap-1 text-xs text-green-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Live
          </span>
          <div className="text-5xl flotar">💬</div>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <div className="burbuja self-start max-w-[85%] rounded-xl rounded-bl-none bg-white/10 px-3 py-2">
              Hola, ¿sigue disponible el auto?
            </div>
            <div className="burbuja self-end max-w-[85%] rounded-xl rounded-br-none bg-brand px-3 py-2"
              style={{ animationDelay: '1.2s' }}>
              ¡Claro! Puedes apartarlo hoy 😊
            </div>
          </div>
          <h3 className="mt-5 text-lg font-semibold text-brand-light">Chat en tiempo real</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Habla directo con propietarios y clientes dentro de la plataforma.
          </p>
        </div>

        <div className={tarjeta}>
          <div className="flex items-center justify-between text-5xl">
            <span className="flotar">🛡️</span>
            <span className="flotar" style={{ animationDelay: '-2s' }}>🔒</span>
          </div>
          <h3 className="mt-6 text-lg font-semibold text-brand-light">Cuentas seguras</h3>
          <p className="mt-2 text-sm text-neutral-400">
            Registro con correo y contraseña, tus datos protegidos.
          </p>
        </div>
      </section>
    </main>
  )
}