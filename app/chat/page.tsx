'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Msg = {
  car_id: string
  sender_id: string
  receiver_id: string
  content: string
}
type AutoLista = { id: string; marca: string; modelo: string; user_id: string }
type Nombre = { id: string; nombre: string | null }
type Conv = { carId: string; otroId: string; ultimo: string; titulo: string; nombre: string }

export default function ChatLista() {
  const router = useRouter()
  const [convs, setConvs] = useState<Conv[]>([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function cargar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return router.push('/login')
      const yo = u.user.id

      const { data: msgs } = await supabase
        .from('messages')
        .select('car_id, sender_id, receiver_id, content')
        .not('borrado_por', 'cs', `{${yo}}`)
        .order('created_at', { ascending: false })

      const mapa = new Map<string, Conv>()
      for (const m of (msgs ?? []) as Msg[]) {
        const otroId = m.sender_id === yo ? m.receiver_id : m.sender_id
        const clave = `${m.car_id}-${otroId}`
        if (!mapa.has(clave)) {
          mapa.set(clave, { carId: m.car_id, otroId, ultimo: m.content, titulo: 'Auto', nombre: '' })
        }
      }

      const lista = Array.from(mapa.values())
      const idsAutos = Array.from(new Set(lista.map((c) => c.carId)))

      let autos: AutoLista[] = []
      if (idsAutos.length > 0) {
        const { data } = await supabase
          .from('cars').select('id, marca, modelo, user_id').in('id', idsAutos)
        autos = (data ?? []) as AutoLista[]
      }

      const idsClientes = Array.from(
        new Set(
          lista
            .filter((c) => autos.find((a) => a.id === c.carId)?.user_id === yo)
            .map((c) => c.otroId)
        )
      )
      let nombres: Nombre[] = []
      if (idsClientes.length > 0) {
        const { data } = await supabase.rpc('nombres_de', { p_ids: idsClientes })
        nombres = (data ?? []) as Nombre[]
      }

      for (const c of lista) {
        const a = autos.find((x) => x.id === c.carId)
        c.titulo = a ? `${a.marca} ${a.modelo}` : 'Auto'
        if (a?.user_id === yo) {
          c.nombre = nombres.find((n) => n.id === c.otroId)?.nombre ?? 'Cliente'
        }
      }

      setConvs(lista)
      setCargando(false)
    }
    cargar()
  }, [router])

  async function eliminar(c: Conv) {
    if (!confirm('¿Eliminar esta conversación? Solo se borra para ti.')) return
    setMensaje('')
    const { error } = await supabase.rpc('borrar_chat', { p_car: c.carId, p_otro: c.otroId })
    if (error) return setMensaje(error.message)
    setConvs((prev) => prev.filter((x) => !(x.carId === c.carId && x.otroId === c.otroId)))
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Mis chats</h1>
      {mensaje && <p className="mb-4 text-sm text-red-700">{mensaje}</p>}
      {cargando && <p>Cargando...</p>}
      {!cargando && convs.length === 0 && <p className="text-neutral-600">Aún no tienes conversaciones.</p>}

      <div className="flex flex-col gap-3">
        {convs.map((c) => (
          <div key={`${c.carId}-${c.otroId}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 bg-white">
            <Link href={`/chat/${c.carId}/${c.otroId}`} className="flex-1 min-w-0">
              <p className="font-semibold">
                {c.titulo}
                {c.nombre && <span className="font-normal text-neutral-500"> · {c.nombre}</span>}
              </p>
              <p className="text-neutral-500 text-sm truncate">{c.ultimo}</p>
            </Link>
            <button onClick={() => eliminar(c)}
              className="px-3 py-1 rounded-lg bg-white text-red-700 border border-red-200 text-sm">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}