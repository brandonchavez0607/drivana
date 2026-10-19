'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMensaje(error.message)
    router.push('/')
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form onSubmit={entrar} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold">Iniciar sesión</h1>
        <input type="email" placeholder="Correo" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-white text-black" />
        <input type="password" placeholder="Contraseña" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-white text-black" />
        <button className="p-2 rounded bg-blue-600 text-white">Entrar</button>
        {mensaje && <p className="text-sm">{mensaje}</p>}
        <a href="/registro" className="text-sm underline">¿No tienes cuenta? Regístrate</a>
      </form>
    </main>
  )
}