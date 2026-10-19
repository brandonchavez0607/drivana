'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type Car = {
  id: string
  marca: string
  modelo: string
  anio: number
  precio: number
  ciudad: string | null
}

export default function Autos() {
  const [autos, setAutos] = useState<Car[]>([])

  useEffect(() => {
    supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setAutos(data ?? []))
  }, [])

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Autos disponibles</h1>
        <Link href="/publicar" className="px-4 py-2 rounded bg-blue-600 text-white">
          Publicar auto
        </Link>
      </div>
      {autos.length === 0 && <p>Aún no hay autos publicados.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {autos.map((a) => (
          <div key={a.id} className="p-4 rounded-lg border border-neutral-700">
            <h2 className="text-xl font-semibold">{a.marca} {a.modelo}</h2>
            <p className="text-neutral-400">{a.anio} · {a.ciudad}</p>
            <p className="mt-2 text-lg font-bold">${a.precio.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </main>
  )
}