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
type Conv = { carId: string; otroId: string; ultimo: string; titulo: string }

export default function ChatLista() {
  const router = useRouter()
  const [convs, setConvs] = useState<Conv[]>([])

  useEffect(() => {
    async function cargar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return router.push('/login')
      const yo = u.user.id

      const { data: msgs } = await supabase
        .from('messages').select('*').order('created_at', { ascending: false })

      const mapa = new Map<string, Conv>()
      for (const m of (msgs ?? []) as Msg[]) {
        const otroId = m.sender_id === yo ? m.receiver_id : m.sender_id
        const clave = `${m.car_id}-${otroId}`
        if (!mapa.has(clave)) {
          mapa.set(clave, { carId: m.car_id, otroId, ultimo: m.content, titulo: 'Auto' })
        }
      }

      const lista = Array.from(mapa.values())
      const ids = Array.from(new Set(lista.map((c) => c.carId)))
      if (ids.length > 0) {
        const { data: autos } = await supabase
          .from('cars').select('id, marca, modelo').in('id', ids)
        for (const c of lista) {
          const a = autos?.find((x) => x.id === c.carId)
          if (a) c.titulo = `${a.marca} ${a.modelo}`
        }
      }
      setConvs(lista)
    }
    cargar()
  }, [router])

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Mis chats</h1>
      {convs.length === 0 && <p>Aún no tienes conversaciones.</p>}
      <div className="flex flex-col gap-3">
        {convs.map((c) => (
          <Link key={`${c.carId}-${c.otroId}`} href={`/chat/${c.carId}/${c.otroId}`}
            className="p-4 rounded-lg border border-neutral-700 hover:bg-neutral-800">
            <p className="font-semibold">{c.titulo}</p>
            <p className="text-neutral-400 text-sm truncate">{c.ultimo}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}