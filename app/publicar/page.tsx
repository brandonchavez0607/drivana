'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export default function Publicar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [archivos, setArchivos] = useState<File[]>([])
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    marca: '', modelo: '', anio: '', precio: '',
    pasajeros: '', transmision: 'Automática', ciudad: '', descripcion: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else setUser(data.user)
    })
  }, [router])

  function cambiar(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setMensaje('Publicando...')

    const urls: string[] = []
    for (const archivo of archivos) {
      const ext = archivo.name.split('.').pop()
      const ruta = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: errSubida } = await supabase.storage.from('autos').upload(ruta, archivo)
      if (errSubida) return setMensaje(errSubida.message)
      urls.push(supabase.storage.from('autos').getPublicUrl(ruta).data.publicUrl)
    }

    const { error } = await supabase.from('cars').insert({
      marca: form.marca,
      modelo: form.modelo,
      anio: Number(form.anio),
      precio_dia: Number(form.precio),
      pasajeros: form.pasajeros ? Number(form.pasajeros) : null,
      transmision: form.transmision,
      ciudad: form.ciudad,
      descripcion: form.descripcion,
      imagen_url: urls[0] ?? null,
      imagenes: urls,
    })
    if (error) return setMensaje(error.message)
    router.push('/autos')
  }

  const input = 'p-2 rounded bg-zinc-950 text-white border border-neutral-700'

  return (
    <main className="min-h-screen flex items-center justify-center py-10">
      <form onSubmit={publicar} className="flex flex-col gap-3 w-96">
        <h1 className="text-2xl font-bold">Registrar un auto en renta</h1>
        <input name="marca" placeholder="Marca" required onChange={cambiar} className={input} />
        <input name="modelo" placeholder="Modelo" required onChange={cambiar} className={input} />
        <input name="anio" type="number" placeholder="Año" required onChange={cambiar} className={input} />
        <input name="precio" type="number" placeholder="Precio por día" required onChange={cambiar} className={input} />
        <input name="pasajeros" type="number" placeholder="Pasajeros" onChange={cambiar} className={input} />
        <select name="transmision" onChange={cambiar} className={input}>
          <option>Automática</option>
          <option>Manual</option>
        </select>
        <input name="ciudad" placeholder="Ciudad" onChange={cambiar} className={input} />
        <textarea name="descripcion" placeholder="Descripción" rows={3} onChange={cambiar} className={input} />
        <label className="text-sm text-neutral-400">Fotos del auto (puedes elegir varias)</label>
        <input type="file" accept="image/*" multiple
          onChange={(e) => setArchivos(Array.from(e.target.files ?? []))} />
        <button className="p-2 rounded bg-violet-600 text-white">Publicar</button>
        {mensaje && <p className="text-sm">{mensaje}</p>}
      </form>
    </main>
  )
}