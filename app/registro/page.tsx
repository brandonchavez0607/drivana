'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Registro() {
  const router = useRouter()
  const [usuario, setUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<'cliente' | 'propietario'>('cliente')
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
    setMensaje('')

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(usuario)) {
      return setMensaje('El nombre de usuario debe tener de 3 a 20 caracteres: letras, números o guion bajo.')
    }

    const { data: libre, error: errNombre } = await supabase.rpc('nombre_disponible', {
      p_nombre: usuario,
    })
    if (errNombre) return setMensaje(errNombre.message)
    if (!libre) return setMensaje('Ese nombre de usuario ya está en uso. Elige otro.')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { rol, nombre_usuario: usuario } },
    })
    if (error) return setMensaje(error.message)
    if (data.session) router.push('/')
    else setMensaje('Cuenta creada. Revisa tu correo para confirmarla.')
  }

  const input = 'p-2 rounded bg-zinc-950 text-white border border-neutral-700'
  const opcion = (activa: boolean) =>
    `p-3 rounded border cursor-pointer ${
      activa ? 'border-white/60 bg-brand' : 'border-neutral-700 bg-zinc-950'
    }`

  return (
    <main
      onMouseMove={mover}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(249,115,22,0.35), transparent 60%)`,
        }}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 flex items-center justify-center text-[16vw] font-extrabold tracking-normal text-black/10"
      >
        RODAYA
      </span>

      <form onSubmit={registrar} className="relative z-10 flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold">Crear cuenta en Rodaya</h1>

        <input type="text" placeholder="Nombre de usuario" required maxLength={20}
          autoComplete="username" value={usuario}
          onChange={(e) => setUsuario(e.target.value.trim())} className={input} />
        <p className="-mt-2 text-xs text-neutral-700">3 a 20 caracteres: letras, números o _</p>

        <input type="email" placeholder="Correo" required value={email}
          onChange={(e) => setEmail(e.target.value)} className={input} />
        <input type="password" placeholder="Contraseña (mínimo 6)" required minLength={6}
          value={password} onChange={(e) => setPassword(e.target.value)} className={input} />

        <p className="text-sm text-neutral-700">¿Cómo vas a usar Rodaya?</p>
        <label className={opcion(rol === 'cliente')}>
          <input type="radio" name="rol" className="mr-2"
            checked={rol === 'cliente'} onChange={() => setRol('cliente')} />
          Quiero rentar autos
        </label>
        <label className={opcion(rol === 'propietario')}>
          <input type="radio" name="rol" className="mr-2"
            checked={rol === 'propietario'} onChange={() => setRol('propietario')} />
          Quiero publicar mis autos en renta
        </label>

        <button className="p-2 rounded bg-brand border border-white/20 text-white">
          Registrarme
        </button>
        {mensaje && <p className="text-sm font-medium text-red-700">{mensaje}</p>}
        <a href="/login" className="text-sm underline">¿Ya tienes cuenta? Inicia sesión</a>
      </form>
    </main>
  )
}