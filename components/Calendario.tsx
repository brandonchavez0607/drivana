'use client'
import { useState } from 'react'

type Rango = { fecha_inicio: string; fecha_fin: string }

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

function diasEntre(a: string, b: string) {
  const dias: string[] = []
  const fin = new Date(b + 'T00:00:00Z')
  for (let d = new Date(a + 'T00:00:00Z'); d <= fin; d.setUTCDate(d.getUTCDate() + 1)) {
    dias.push(d.toISOString().slice(0, 10))
  }
  return dias
}

export default function Calendario({
  ocupadas, inicio, fin, onChange,
}: {
  ocupadas: Rango[]
  inicio: string | null
  fin: string | null
  onChange: (inicio: string | null, fin: string | null) => void
}) {
  const ahora = new Date()
  const hoy = fmt(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const [vista, setVista] = useState({ y: ahora.getFullYear(), m: ahora.getMonth() })

  const ocupado = (f: string) =>
    ocupadas.some((o) => f >= o.fecha_inicio && f <= o.fecha_fin)

  function elegir(f: string) {
    if (!inicio || fin || f < inicio) return onChange(f, null)
    if (diasEntre(inicio, f).some(ocupado)) return onChange(f, null)
    onChange(inicio, f)
  }

  function mover(delta: number) {
    const d = new Date(vista.y, vista.m + delta, 1)
    setVista({ y: d.getFullYear(), m: d.getMonth() })
  }

  const primerDia = new Date(vista.y, vista.m, 1).getDay()
  const totalDias = new Date(vista.y, vista.m + 1, 0).getDate()
  const celdas: (number | null)[] = [
    ...Array(primerDia).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]
  const nombre = new Date(vista.y, vista.m, 1).toLocaleDateString('es-MX', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="rounded-xl border border-neutral-800 bg-zinc-950 p-4">
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => mover(-1)} className="px-3 py-1 rounded bg-neutral-800">‹</button>
        <span className="font-semibold capitalize">{nombre}</span>
        <button type="button" onClick={() => mover(1)} className="px-3 py-1 rounded bg-neutral-800">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500 mb-1">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => <span key={i}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {celdas.map((dia, i) => {
          if (dia === null) return <span key={i} />
          const f = fmt(vista.y, vista.m, dia)
          const deshabilitado = f < hoy || ocupado(f)
          const extremo = f === inicio || f === fin
          const enRango = inicio && fin && f > inicio && f < fin
          const clase = deshabilitado
            ? 'text-neutral-700 line-through cursor-not-allowed'
            : extremo
            ? 'bg-violet-600 text-white'
            : enRango
            ? 'bg-violet-900 text-white'
            : 'hover:bg-neutral-800'
          return (
            <button key={i} type="button" disabled={deshabilitado}
              onClick={() => elegir(f)}
              className={`py-2 rounded ${clase}`}>
              {dia}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-neutral-500 mt-3">Los días tachados no están disponibles.</p>
    </div>
  )
}