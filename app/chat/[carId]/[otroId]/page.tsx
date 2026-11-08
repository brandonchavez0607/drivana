'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

type Msg = {
  id: string
  car_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
}
type Auto = { marca: string; modelo: string; user_id: string }
type Renta = {
  id: string
  fecha_inicio: string
  fecha_fin: string
  total: number
  deposito: number | null
  estado: string
}

const dinero = (n: number) => `$${Number(n).toLocaleString()}`
const estadoVisible = (e: string) => (e === 'pagada' ? 'confirmada' : e)

function Chat() {
  const { carId, otroId } = useParams<{ carId: string; otroId: string }>()
  const router = useRouter()
  const [yo, setYo] = useState<string | null>(null)
  const [auto, setAuto] = useState<Auto | null>(null)
  const [nombreCliente, setNombreCliente] = useState('')
  const [renta, setRenta] = useState<Renta | null>(null)
  const [cargado, setCargado] = useState(false)
  const [mensajes, setMensajes] = useState<Msg[]>([])
  const [texto, setTexto] = useState('')
  const [error, setError] = useState('')
  const fondo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let activo = true
    let canal: ReturnType<typeof supabase.channel> | null = null

    async function iniciar() {
      const { data } = await supabase.auth.getUser()
      if (!activo) return
      if (!data.user) return router.push('/login')
      const id = data.user.id
      setYo(id)

      const { data: datosAuto } = await supabase
        .from('cars').select('marca, modelo, user_id').eq('id', carId).single()
      if (!activo) return
      const a = (datosAuto as Auto | null) ?? null
      setAuto(a)

      const soyPropietario = a?.user_id === id
      const clienteId = soyPropietario ? otroId : id

      if (soyPropietario) {
        const { data: nombres } = await supabase.rpc('nombres_de', { p_ids: [otroId] })
        if (!activo) return
        setNombreCliente((nombres?.[0]?.nombre as string | undefined) ?? '')
      }

      const { data: rentas } = await supabase
        .from('rentas')
        .select('id, fecha_inicio, fecha_fin, total, deposito, estado')
        .eq('car_id', carId)
        .eq('renter_id', clienteId)
        .neq('estado', 'cancelada')
        .order('created_at', { ascending: false })
        .limit(1)
      if (!activo) return
      setRenta((rentas?.[0] as Renta | undefined) ?? null)

      const { data: msgs } = await supabase
        .from('messages').select('*')
        .eq('car_id', carId)
        .or(`and(sender_id.eq.${id},receiver_id.eq.${otroId}),and(sender_id.eq.${otroId},receiver_id.eq.${id})`)
        .not('borrado_por', 'cs', `{${id}}`)
        .order('created_at', { ascending: true })
      if (!activo) return
      setMensajes((msgs ?? []) as Msg[])
      setCargado(true)

      canal = supabase
        .channel(`chat-${carId}-${id}-${otroId}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `car_id=eq.${carId}` },
          (payload) => {
            const m = payload.new as Msg
            const mio = m.sender_id === id && m.receiver_id === otroId
            const suyo = m.sender_id === otroId && m.receiver_id === id
            if (mio || suyo) {
              setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
            }
          })
        .subscribe()
    }

    iniciar()
    return () => {
      activo = false
      if (canal) supabase.removeChannel(canal)
    }
  }, [carId, otroId, router])

  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const contenido = texto.trim()
    if (!contenido) return
    setTexto('')
    const { data } = await supabase
      .from('messages')
      .insert({ car_id: carId, receiver_id: otroId, content: contenido })
      .select().single()
    if (data) {
      setMensajes((prev) => (prev.some((x) => x.id === data.id) ? prev : [...prev, data as Msg]))
    }
  }

  async function eliminarChat() {
    if (!confirm('¿Eliminar esta conversación? Solo se borra para ti; la otra persona conserva la suya.')) return
    setError('')
    const { error: err } = await supabase.rpc('borrar_chat', { p_car: carId, p_otro: otroId })
    if (err) return setError(err.message)
    router.push('/chat')
  }

  if (yo && yo === otroId) {
    return (
      <main className="p-10">
        Este es tu propio auto. Espera a que un cliente te escriba desde el menú Chat.
      </main>
    )
  }

  const soyPropietario = !!yo && auto?.user_id === yo

  return (
    <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold truncate">
            {auto ? `${auto.marca} ${auto.modelo}` : 'Chat'}
          </h1>
          {soyPropietario && (
            <p className="text-sm text-neutral-500">Cliente: {nombreCliente || 'sin nombre de usuario'}</p>
          )}
        </div>
        <button onClick={eliminarChat}
          className="px-3 py-1 rounded-lg bg-white text-red-700 border border-red-200 text-sm whitespace-nowrap">
          Eliminar chat
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      {cargado && (
        <div className="p-4 rounded-xl border border-neutral-200 bg-white text-sm">
          {renta ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  Reserva {estadoVisible(renta.estado)}
                </p>
                <p className="text-neutral-600">
                  {renta.fecha_inicio} → {renta.fecha_fin} · Total {dinero(renta.total)}
                  {renta.deposito ? ` · Pagado ${dinero(renta.deposito)}` : ''}
                </p>
              </div>
              <Link href="/mis-reservas"
                className="px-4 py-2 rounded-full bg-brand text-white font-semibold">
                Ver en Reservas
              </Link>
            </div>
          ) : soyPropietario ? (
            <p className="text-neutral-600">Este cliente aún no tiene una reserva de este auto.</p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-neutral-600">Aún no tienes una reserva de este auto.</p>
              <Link href={`/autos/${carId}`}
                className="px-4 py-2 rounded-full bg-brand text-white font-semibold">
                Reservar este auto
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="h-[45vh] overflow-y-auto flex flex-col gap-2 border border-neutral-200 rounded-xl p-4 bg-white">
        {mensajes.length === 0 && <p className="text-neutral-500">Escribe el primer mensaje.</p>}
        {mensajes.map((m) => (
          <div key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded-2xl ${
              m.sender_id === yo
                ? 'self-end bg-brand text-white'
                : 'self-start bg-neutral-100 text-neutral-900'
            }`}>
            {m.content}
          </div>
        ))}
        <div ref={fondo} />
      </div>

      <form onSubmit={enviar} className="flex gap-2">
        <input value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-2 rounded-lg bg-white text-neutral-900 border border-neutral-300" />
        <button className="px-5 rounded-lg bg-brand text-white font-semibold">Enviar</button>
      </form>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<main className="p-10">Cargando chat...</main>}>
      <Chat />
    </Suspense>
  )
}