'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useRol, nombreRol } from '../lib/rol'

export default function Navbar() {
  const router = useRouter()
  const rol = useRol()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: escucha } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => escucha.subscription.unsubscribe()
  }, [])

  async function salir() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const esPropietario = rol === 'propietario' || rol === 'admin' || rol === 'superadmin'
  const esAdmin = rol === 'admin' || rol === 'superadmin'

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur border-b border-white/10 text-white">
      <Link href="/" className="text-2xl font-extrabold tracking-tight hover:opacity-80 transition">
        Drivana
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/autos">Autos</Link>
        {user ? (
          <>
            {esPropietario && <Link href="/mis-autos">Mis autos</Link>}
            <Link href="/mis-reservas">Reservas</Link>
            <Link href="/chat">Chat</Link>
            {esAdmin && <Link href="/admin">Panel admin</Link>}
            <span className="text-neutral-400">{user.email}</span>
            {rol && (
              <span className="px-2 py-0.5 rounded bg-brand border border-white/20 text-xs">
                {nombreRol[rol]}
              </span>
            )}
            <button onClick={salir} className="px-3 py-1 rounded bg-red-600">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/registro" className="px-3 py-1 rounded bg-brand border border-white/20">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}