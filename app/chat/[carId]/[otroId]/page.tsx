'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
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

function Chat() {
  const { carId, otroId } = useParams<{ carId: string; otroId: string }>()
  const router = useRouter()
  const [yo, setYo] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Msg[]>([])
  const [texto, setTexto] = useState('')
  const [titulo, setTitulo] = useState('')
  const fondo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let canal: ReturnType<typeof supabase.channel> | null = null

    async function iniciar() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return router.push('/login')
      const id = data.user.id
      setYo(id)

      const { data: auto } = await supabase
        .from('cars').select('marca, modelo').eq('id', carId).single()
      if (auto) setTitulo(`${auto.marca} ${auto.modelo}`)

      const { data: msgs } = await supabase
        .from('messages').select('*')
        .eq('car_id', carId)
        .or(`and(sender_id.eq.${id},receiver_id.eq.${otroId}),and(sender_id.eq.${otroId},receiver_id.eq.${id})`)
        .order('created_at', { ascending: true })
      setMensajes((msgs ?? []) as Msg[])

      canal = supabase
        .channel(`chat-${carId}-${id}-${otroId}`)
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
    return () => { if (canal) supabase.removeChannel(canal) }
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

  if (yo && yo === otroId) {
    return <main className="p-10">Este es tu propio auto. Espera a que un comprador te escriba desde el menú Chat.</main>
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col h-[85vh]">
      <h1 className="text-2xl font-bold mb-4">Chat: {titulo}</h1>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 border border-neutral-700 rounded-lg p-4">
        {mensajes.length === 0 && <p className="text-neutral-500">Escribe el primer mensaje.</p>}
        {mensajes.map((m) => (
          <div key={m.id}
            className={`max-w-[75%] px-3 py-2 rounded-lg ${
              m.sender_id === yo ? 'self-end bg-blue-600 text-white' : 'self-start bg-neutral-700 text-white'
            }`}>
            {m.content}
          </div>
        ))}
        <div ref={fondo} />
      </div>
      <form onSubmit={enviar} className="flex gap-2 mt-4">
        <input value={texto} onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..." className="flex-1 p-2 rounded bg-white text-black" />
        <button className="px-4 rounded bg-blue-600 text-white">Enviar</button>
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