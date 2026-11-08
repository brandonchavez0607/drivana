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

export type PerfilBasico = { rol: Rol; nombre: string | null }

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilBasico | null>(null)

  useEffect(() => {
    let activo = true

    async function cargar() {
      const { data: u } = await supabase.auth.getUser()
      if (!u.user) {
        if (activo) setPerfil(null)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('rol, nombre_usuario')
        .eq('id', u.user.id)
        .single()
      if (activo) {
        setPerfil({
          rol: (data?.rol as Rol) ?? 'cliente',
          nombre: data?.nombre_usuario ?? null,
        })
      }
    }

    cargar()
    const { data: escucha } = supabase.auth.onAuthStateChange(() => cargar())
    return () => {
      activo = false
      escucha.subscription.unsubscribe()
    }
  }, [])

  return perfil
}

export function useRol() {
  return usePerfil()?.rol ?? null
}