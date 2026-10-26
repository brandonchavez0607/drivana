'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export type Rol = 'cliente' | 'propietario' | 'admin' | 'superadmin'

export const ROLES: Rol[] = ['cliente', 'propietario', 'admin', 'superadmin']

export const nombreRol: Record<Rol, string> = {
  cliente: 'Cliente',
  propietario: 'Propietario',
  admin: 'Administrador',
  superadmin: 'Desarrollador',
}

export function useRol() {
  const [rol, setRol] = useState<Rol | null>(null)

  useEffect(() => {
    let activo = true

    async function cargar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) {
        if (activo) setRol(null)
        return
      }
      const { data } = await supabase
        .from('profiles').select('rol').eq('id', u.user.id).single()
      if (activo) setRol((data?.rol as Rol) ?? 'cliente')
    }

    cargar()
    const { data: escucha } = supabase.auth.onAuthStateChange(() => cargar())
    return () => {
      activo = false
      escucha.subscription.unsubscribe()
    }
  }, [])

  return rol
}