'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Publicar() {
  const router = useRouter()
  const [mensaje, setMensaje] = useState('')
  const [form, setForm] = useState({
    marca: '', modelo: '', anio: '', precio: '',
    kilometraje: '', ciudad: '', descripcion: '',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
    })
  }, [router])

  function cambiar(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('cars').insert({
      marca: form.marca,
      modelo: form.modelo,
      anio: Number(form.anio),
      precio: Number(form.precio),
      kilometraje: form.kilometraje ? Number(form.kilometraje) : null,
      ciudad: form.ciudad,
      descripcion: form.descripcion,
    })
    if (error) return setMensaje(error.message)
    router.push('/autos')
  }

  const input = 'p-2 rounded bg-white text-black'

  return (
    <main className="min-h-screen flex items-center justify-center py-10">
      <form onSubmit={publicar} className="flex flex-col gap-3 w-96">
        <h1 className="text-2xl font-bold">Publicar un auto</h1>
        <input name="marca" placeholder="Marca" required onChange={cambiar} className={input} />
        <input name="modelo" placeholder="Modelo" required onChange={cambiar} className={input} />
        <input name="anio" type="number" placeholder="Año" required onChange={cambiar} className={input} />
        <input name="precio" type="number" placeholder="Precio" required onChange={cambiar} className={input} />
        <input name="kilometraje" type="number" placeholder="Kilometraje" onChange={cambiar} className={input} />
        <input name="ciudad" placeholder="Ciudad" onChange={cambiar} className={input} />
        <textarea name="descripcion" placeholder="Descripción" rows={3} onChange={cambiar} className={input} />
        <button className="p-2 rounded bg-blue-600 text-white">Publicar</button>
        {mensaje && <p className="text-sm">{mensaje}</p>}
      </form>
    </main>
  )
}