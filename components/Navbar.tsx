'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function salir() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-neutral-900 text-white">
      <Link href="/" className="text-xl font-bold">Drivana</Link>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/">Inicio</Link>
        <Link href="/autos">Autos</Link>
        {user ? (
          <>
            <Link href="/mis-autos">Mis autos</Link>
            <Link href="/mis-reservas">Reservas</Link>
            <Link href="/chat">Chat</Link>
            <span className="text-neutral-400">{user.email}</span>
            <button onClick={salir} className="px-3 py-1 rounded bg-red-600">
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Iniciar sesión</Link>
            <Link href="/registro" className="px-3 py-1 rounded bg-blue-600">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}