'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Renta = {
  id: string
  car_id: string
  renter_id: string
  owner_id: string
  fecha_inicio: string
  fecha_fin: string
  total: number
  estado: string
  metodo_deposito: string | null
  deposito: number | null
  referencia: string | null
  cars: { marca: string; modelo: string; imagen_url: string | null } | null
}

function hoyLocal() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const colores: Record<string, string> = {
  pendiente: 'bg-yellow-600',
  confirmada: 'bg-green-600',
  pagada: 'bg-green-600',
  cancelada: 'bg-red-600',
}

function MisReservas() {
  const router = useRouter()
  const [yo, setYo] = useState<string | null>(null)
  const [rentas, setRentas] = useState<Renta[]>([])
  const [vista, setVista] = useState<'cliente' | 'propietario'>('cliente')
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return router.push('/login')
      setYo(u.user.id)
      const { data } = await supabase
        .from('rentas')
        .select('*, cars(marca, modelo, imagen_url)')
        .order('fecha_inicio', { ascending: false })
      setRentas((data ?? []) as unknown as Renta[])
      setCargando(false)
    }
    cargar()
  }, [router])

  async function cancelar(id: string) {
    if (!confirm('¿Cancelar esta reserva?')) return
    const { error } = await supabase.from('rentas').update({ estado: 'cancelada' }).eq('id', id)
    if (!error) {
      setRentas((prev) => prev.map((r) => (r.id === id ? { ...r, estado: 'cancelada' } : r)))
    }
  }

  async function borrar(id: string) {
    if (!confirm('¿Borrar esta reserva de tu lista? No se puede deshacer.')) return
    setMensaje('')
    const { data, error } = await supabase.from('rentas').delete().eq('id', id).select()
    if (error || !data || data.length === 0) {
      return setMensaje('No se pudo borrar la reserva.')
    }
    setRentas((prev) => prev.filter((r) => r.id !== id))
  }

  async function limpiar() {
    if (!yo) return
    if (!confirm('¿Borrar todas tus reservas canceladas y pendientes? No se puede deshacer.')) return
    setMensaje('')
    const { data, error } = await supabase
      .from('rentas')
      .delete()
      .eq('renter_id', yo)
      .in('estado', ['cancelada', 'pendiente'])
      .select()
    if (error) return setMensaje(error.message)
    const ids = new Set((data ?? []).map((r) => r.id as string))
    setRentas((prev) => prev.filter((r) => !ids.has(r.id)))
  }

  const hoy = hoyLocal()
  const lista = rentas.filter((r) =>
    vista === 'cliente' ? r.renter_id === yo : r.owner_id === yo
  )
  const borrables = lista.filter(
    (r) => vista === 'cliente' && (r.estado === 'cancelada' || r.estado === 'pendiente')
  )

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Mis reservas</h1>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button onClick={() => setVista('cliente')}
          className={`px-4 py-2 rounded ${vista === 'cliente' ? 'bg-brand border border-white/20 text-white' : 'bg-neutral-800'}`}>
          Mis rentas
        </button>
        <button onClick={() => setVista('propietario')}
          className={`px-4 py-2 rounded ${vista === 'propietario' ? 'bg-brand border border-white/20 text-white' : 'bg-neutral-800'}`}>
          Reservas de mis autos
        </button>

        {borrables.length > 0 && (
          <button onClick={limpiar}
            className="ml-auto px-4 py-2 rounded border border-red-500/60 text-red-300 hover:bg-red-950">
            Borrar canceladas y pendientes ({borrables.length})
          </button>
        )}
      </div>

      {mensaje && <p className="mb-4 text-sm text-red-400">{mensaje}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && lista.length === 0 && (
        <p>
          {vista === 'cliente' ? 'Aún no has reservado ningún auto. ' : 'Aún no tienes reservas en tus autos. '}
          {vista === 'cliente' && <Link href="/autos" className="underline text-brand-light">Ver autos</Link>}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {lista.map((r) => {
          const puedeCancelar = r.estado !== 'cancelada' && r.fecha_inicio >= hoy
          const puedeBorrar =
            vista === 'cliente' && (r.estado === 'cancelada' || r.estado === 'pendiente')
          return (
            <div key={r.id}
              className="flex gap-4 p-4 rounded-xl border border-neutral-800 bg-black">
              {r.cars?.imagen_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.cars.imagen_url} alt="" className="w-32 h-24 object-cover rounded" />
              ) : (
                <div className="w-32 h-24 rounded bg-neutral-800" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    {r.cars ? `${r.cars.marca} ${r.cars.modelo}` : 'Auto'}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded ${colores[r.estado] ?? 'bg-neutral-700'}`}>
                    {r.estado === 'pagada' ? 'confirmada' : r.estado}
                  </span>
                </div>
                <p className="text-neutral-400 text-sm">{r.fecha_inicio} → {r.fecha_fin}</p>
                <p className="text-sm">
                  Total: ${Number(r.total).toLocaleString()}
                  {r.deposito ? ` · Pagado: $${Number(r.deposito).toLocaleString()}` : ''}
                </p>
                {r.metodo_deposito && (
                  <p className="text-sm text-neutral-400">
                    {r.metodo_deposito}{r.referencia ? ` · Ref. ${r.referencia}` : ''}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  <Link href={`/chat/${r.car_id}/${vista === 'cliente' ? r.owner_id : r.renter_id}`}
                    className="px-3 py-1 rounded bg-white text-black text-sm">
                    {vista === 'cliente' ? 'Contactar propietario' : 'Contactar cliente'}
                  </Link>
                  {puedeCancelar && (
                    <button onClick={() => cancelar(r.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white text-sm">
                      Cancelar reserva
                    </button>
                  )}
                  {puedeBorrar && (
                    <button onClick={() => borrar(r.id)}
                      className="px-3 py-1 rounded border border-red-500/60 text-red-300 text-sm hover:bg-red-950">
                      Borrar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<main className="p-10">Cargando...</main>}>
      <MisReservas />
    </Suspense>
  )
}