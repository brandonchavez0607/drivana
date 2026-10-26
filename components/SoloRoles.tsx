'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import type { Rol } from '../lib/rol'

export default function SoloRoles({
  roles,
  ofrecerPropietario = false,
  children,
}: {
  roles: Rol[]
  ofrecerPropietario?: boolean
  children: React.ReactNode
}) {
  const [estado, setEstado] = useState<
    'cargando' | 'ok' | 'sin-sesion' | 'cliente' | 'prohibido'
  >('cargando')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    async function revisar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) return setEstado('sin-sesion')
      const { data } = await supabase
        .from('profiles').select('rol').eq('id', u.user.id).single()
      const rol = (data?.rol ?? 'cliente') as Rol
      if (roles.includes(rol)) setEstado('ok')
      else if (ofrecerPropietario && rol === 'cliente') setEstado('cliente')
      else setEstado('prohibido')
    }
    revisar()
  }, [roles, ofrecerPropietario])

  async function activar() {
    const { error } = await supabase.rpc('volverme_propietario')
    if (error) return setMensaje(error.message)
    window.location.reload()
  }

  if (estado === 'ok') return <>{children}</>

  const caja = 'max-w-md mx-auto mt-24 p-6 rounded-xl border border-white/15 bg-black text-center flex flex-col gap-4'

  if (estado === 'cargando') return <main className="p-10">Cargando...</main>

  if (estado === 'sin-sesion') {
    return (
      <main className={caja}>
        <h1 className="text-xl font-bold">Inicia sesión</h1>
        <p className="text-neutral-400">Necesitas una cuenta para entrar a esta página.</p>
        <Link href="/login" className="p-3 rounded bg-brand border border-white/20 font-semibold">
          Iniciar sesión
        </Link>
      </main>
    )
  }

  if (estado === 'cliente') {
    return (
      <main className={caja}>
        <h1 className="text-xl font-bold">Cuenta de propietario</h1>
        <p className="text-neutral-400">
          Tu cuenta es de cliente. Para publicar autos en renta necesitas activar la
          cuenta de propietario. Seguirás pudiendo rentar autos.
        </p>
        <button onClick={activar} className="p-3 rounded bg-brand border border-white/20 font-semibold">
          Activar cuenta de propietario
        </button>
        {mensaje && <p className="text-sm text-red-400">{mensaje}</p>}
      </main>
    )
  }

  return (
    <main className={caja}>
      <h1 className="text-xl font-bold">Sin permiso</h1>
      <p className="text-neutral-400">Tu tipo de cuenta no puede entrar a esta página.</p>
      <Link href="/" className="p-3 rounded bg-white text-black font-semibold">Ir al inicio</Link>
    </main>
  )
}