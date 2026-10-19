'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type Car = {
  id: string
  marca: string
  modelo: string
  anio: number
  precio_dia: number
  imagen_url: string | null
}

export default function MisAutos() {
  const router = useRouter()
  const [autos, setAutos] = useState<Car[]>([])

  useEffect(() => {
    async function cargar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return router.push('/login')
      const { data } = await supabase
        .from('cars').select('*')
        .eq('user_id', u.user.id)
        .order('created_at', { ascending: false })
      setAutos(data ?? [])
    }
    cargar()
  }, [router])

  async function borrar(id: string) {
    if (!confirm('¿Eliminar este auto?')) return
    const { error } = await supabase.from('cars').delete().eq('id', id)
    if (!error) setAutos((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis autos</h1>
        <Link href="/publicar" className="px-4 py-2 rounded bg-blue-600 text-white">
          Publicar auto
        </Link>
      </div>
      {autos.length === 0 && <p>Aún no has publicado autos.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {autos.map((a) => (
          <div key={a.id} className="rounded-lg border border-neutral-700 overflow-hidden">
            {a.imagen_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.imagen_url} alt={`${a.marca} ${a.modelo}`}
                className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-neutral-800 flex items-center justify-center text-neutral-500">
                Sin foto
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold">{a.marca} {a.modelo}</h2>
              <p className="text-neutral-400">{a.anio}</p>
              <p className="mt-2 text-lg font-bold">${a.precio.toLocaleString()}</p>
              <button onClick={() => borrar(a.id)}
                className="mt-3 px-3 py-1 rounded bg-red-600 text-white text-sm">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}