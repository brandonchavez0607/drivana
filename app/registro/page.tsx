'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Registro() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function registrar(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return setMensaje(error.message)
    if (data.session) router.push('/')
    else setMensaje('Cuenta creada. Revisa tu correo para confirmarla.')
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={registrar} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold">Crear cuenta en Drivana</h1>
        <input type="email" placeholder="Correo" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-white text-black" />
        <input type="password" placeholder="Contraseña (mínimo 6)" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-white text-black" />
        <button className="p-2 rounded bg-blue-600 text-white">Registrarme</button>
        {mensaje && <p className="text-sm">{mensaje}</p>}
        <a href="/login" className="text-sm underline">¿Ya tienes cuenta? Inicia sesión</a>
      </form>
    </main>
  )
}