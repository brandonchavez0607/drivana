'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Registro() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [pos, setPos] = useState({ x: 50, y: 60 })

  function mover(e: React.MouseEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    })
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return setMensaje(error.message)
    if (data.session) router.push('/')
    else setMensaje('Cuenta creada. Revisa tu correo para confirmarla.')
  }

  const input = 'p-2 rounded bg-zinc-950 text-white border border-neutral-700'

  return (
    <main
      onMouseMove={mover}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Brillo morado que sigue al ratón */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(139,92,246,0.35), transparent 60%)`,
        }}
      />

      {/* Marca de agua fija */}
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center text-[22vw] font-extrabold text-white/10"
      >
        DRIVANA
      </span>

      <form onSubmit={registrar} className="relative z-10 flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold">Crear cuenta en Drivana</h1>
        <input type="email" placeholder="Correo" required value={email}
          onChange={(e) => setEmail(e.target.value)} className={input} />
        <input type="password" placeholder="Contraseña (mínimo 6)" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        <button className="p-2 rounded bg-violet-600 text-white">Registrarme</button>
        {mensaje && <p className="text-sm">{mensaje}</p>}
        <a href="/login" className="text-sm underline">¿Ya tienes cuenta? Inicia sesión</a>
      </form>
    </main>
  )
}