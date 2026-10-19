'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'
import Calendario from '../../../components/Calendario'

type Car = {
  id: string
  user_id: string
  marca: string
  modelo: string
  anio: number
  precio_dia: number
  ciudad: string | null
  descripcion: string | null
  transmision: string | null
  pasajeros: number | null
  imagen_url: string | null
  imagenes: string[] | null
}
type Rango = { fecha_inicio: string; fecha_fin: string }

function DetalleAuto() {
  const { id } = useParams<{ id: string }>()
  const [car, setCar] = useState<Car | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [ocupadas, setOcupadas] = useState<Rango[]>([])
  const [inicio, setInicio] = useState<string | null>(null)
  const [fin, setFin] = useState<string | null>(null)
  const [foto, setFoto] = useState(0)
  const [paso, setPaso] = useState<'elegir' | 'pago' | 'listo'>('elegir')
  const [rentaId, setRentaId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: u } = await supabase.auth.getUser()
      setUser(u.user)
      const { data } = await supabase.from('cars').select('*').eq('id', id).single()
      setCar(data as Car)
      const { data: oc } = await supabase.rpc('fechas_ocupadas', { p_car: id })
      setOcupadas((oc ?? []) as Rango[])
    }
    cargar()
  }, [id])

  if (!car) return <main className="p-10">Cargando...</main>

  const fotos = car.imagenes?.length ? car.imagenes : car.imagen_url ? [car.imagen_url] : []
  const dias =
    inicio && fin
      ? Math.round((new Date(fin).getTime() - new Date(inicio).getTime()) / 86400000) + 1
      : 0
  const total = dias * car.precio_dia
  const esMio = user?.id === car.user_id

  async function reservar() {
    if (!car || !inicio || !fin) return
    const { data, error } = await supabase
      .from('rentas')
      .insert({
        car_id: car.id,
        owner_id: car.user_id,
        fecha_inicio: inicio,
        fecha_fin: fin,
        total,
        estado: 'pendiente',
      })
      .select().single()
    if (error) {
      return setMensaje(
        error.code === '23P01' ? 'Esas fechas ya fueron reservadas. Elige otras.' : error.message
      )
    }
    setOcupadas((prev) => [...prev, { fecha_inicio: inicio, fecha_fin: fin }])
    setRentaId(data.id)
    setPaso('pago')
    setMensaje('')
  }

  async function pagar() {
    const { error } = await supabase.from('rentas').update({ estado: 'pagada' }).eq('id', rentaId)
    if (error) return setMensaje(error.message)
    setPaso('listo')
    setMensaje('')
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-2">
      <section>
        <div className="rounded-xl overflow-hidden border border-neutral-800 bg-zinc-950">
          {fotos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotos[foto]} alt={`${car.marca} ${car.modelo}`}
              className="w-full h-80 object-cover" />
          ) : (
            <div className="w-full h-80 flex items-center justify-center text-neutral-500">Sin foto</div>
          )}
        </div>
        {fotos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {fotos.map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={f} alt="" onClick={() => setFoto(i)}
                className={`h-20 w-28 object-cover rounded cursor-pointer border-2 ${
                  i === foto ? 'border-violet-500' : 'border-transparent'
                }`} />
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold mt-6">{car.marca} {car.modelo}</h1>
        <p className="text-neutral-400">{car.anio} · {car.ciudad}</p>
        <p className="text-2xl font-bold text-violet-400 mt-2">
          ${car.precio_dia.toLocaleString()}
          <span className="text-sm font-normal text-neutral-400"> / día</span>
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="p-3 rounded-lg border border-neutral-800 bg-zinc-950">
            <span className="text-neutral-500">Transmisión</span>
            <p>{car.transmision ?? 'No especificada'}</p>
          </div>
          <div className="p-3 rounded-lg border border-neutral-800 bg-zinc-950">
            <span className="text-neutral-500">Pasajeros</span>
            <p>{car.pasajeros ?? 'No especificado'}</p>
          </div>
        </div>
        {car.descripcion && <p className="mt-4 text-neutral-300">{car.descripcion}</p>}
      </section>

      <section className="flex flex-col gap-4">
        {esMio ? (
          <p className="p-4 rounded-lg border border-neutral-800">Este es tu auto. Los clientes podrán reservarlo desde aquí.</p>
        ) : paso === 'elegir' ? (
          <>
            <h2 className="text-xl font-semibold">Elige tus fechas</h2>
            <Calendario ocupadas={ocupadas} inicio={inicio} fin={fin}
              onChange={(i, f) => { setInicio(i); setFin(f); setMensaje('') }} />
            {dias > 0 && (
              <div className="p-4 rounded-lg border border-neutral-800 bg-zinc-950">
                <p>{inicio} → {fin}</p>
                <p className="text-neutral-400">{dias} {dias === 1 ? 'día' : 'días'} × ${car.precio_dia.toLocaleString()}</p>
                <p className="text-xl font-bold text-violet-400">Total: ${total.toLocaleString()}</p>
              </div>
            )}
            {user ? (
              <button onClick={reservar} disabled={dias === 0}
                className="p-3 rounded bg-violet-600 text-white font-semibold disabled:opacity-40">
                Reservar
              </button>
            ) : (
              <Link href="/login" className="p-3 rounded bg-violet-600 text-white text-center font-semibold">
                Inicia sesión para reservar
              </Link>
            )}
          </>
        ) : paso === 'pago' ? (
          <div className="p-5 rounded-xl border border-neutral-800 bg-zinc-950 flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Pago de tu reserva</h2>
            <p>{car.marca} {car.modelo} · {inicio} → {fin}</p>
            <p className="text-2xl font-bold text-violet-400">${total.toLocaleString()}</p>
            <p className="text-xs text-neutral-500">
              Pago de demostración: no se solicitan ni se guardan datos de tarjeta.
            </p>
            <button onClick={pagar} className="p-3 rounded bg-violet-600 text-white font-semibold">
              Pagar ahora
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-xl border border-violet-600 bg-zinc-950">
            <h2 className="text-xl font-semibold text-violet-400">¡Reserva confirmada!</h2>
            <p className="mt-2">{car.marca} {car.modelo} · {inicio} → {fin}</p>
            <p className="text-neutral-400">Total pagado: ${total.toLocaleString()}</p>
          </div>
        )}

        {!esMio && (
          <Link href={`/chat/${car.id}/${car.user_id}`}
            className="p-3 rounded bg-white text-black text-center font-semibold">
            Contactar al propietario
          </Link>
        )}
        {mensaje && <p className="text-sm text-red-400">{mensaje}</p>}
      </section>
    </main>
  )
}
export default function Page() {
  return (
    <Suspense fallback={<main className="p-10">Cargando...</main>}>
      <DetalleAuto />
    </Suspense>
  )
}