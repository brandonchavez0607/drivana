'use client'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ROLES, nombreRol, type Rol } from '../../lib/rol'

type Perfil = { id: string; email: string | null; rol: Rol; created_at: string }
type Auto = {
  id: string
  user_id: string
  marca: string
  modelo: string
  anio: number
  precio_dia: number
}

export default function Admin() {
  const [yo, setYo] = useState<string | null>(null)
  const [miRol, setMiRol] = useState<Rol | null>(null)
  const [perfiles, setPerfiles] = useState<Perfil[]>([])
  const [autos, setAutos] = useState<Auto[]>([])
  const [totalRentas, setTotalRentas] = useState(0)
  const [vista, setVista] = useState<'usuarios' | 'autos'>('usuarios')
  const [mensaje, setMensaje] = useState('')

  const cargar = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser()
    if (!u.user) return
    const miId = u.user.id
    setYo(miId)

    const { data: datosPerfiles } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: true })
    const lista = (datosPerfiles ?? []) as Perfil[]
    setPerfiles(lista)
    setMiRol(lista.find((p) => p.id === miId)?.rol ?? null)

    const { data: datosAutos } = await supabase
      .from('cars')
      .select('id, user_id, marca, modelo, anio, precio_dia')
      .order('created_at', { ascending: false })
    setAutos((datosAutos ?? []) as Auto[])

    const { count } = await supabase
      .from('rentas').select('*', { count: 'exact', head: true })
    setTotalRentas(count ?? 0)
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const puedeEditar = (p: Perfil) =>
    p.id !== yo &&
    (miRol === 'superadmin' ||
      (miRol === 'admin' && (p.rol === 'cliente' || p.rol === 'propietario')))

  const opciones = (p: Perfil) =>
    ROLES.filter(
      (r) => miRol === 'superadmin' || r === 'cliente' || r === 'propietario' || r === p.rol
    )

  const correo = (id: string) => perfiles.find((p) => p.id === id)?.email ?? id.slice(0, 8)

  async function cambiarRol(id: string, rol: Rol) {
    setMensaje('')
    const { data, error } = await supabase
      .from('profiles').update({ rol }).eq('id', id).select()
    if (error || !data || data.length === 0) {
      return setMensaje('No tienes permiso para hacer ese cambio.')
    }
    setPerfiles((prev) => prev.map((p) => (p.id === id ? { ...p, rol } : p)))
  }

  async function borrarAuto(id: string) {
    if (!confirm('¿Eliminar este auto?')) return
    const { error } = await supabase.from('cars').delete().eq('id', id)
    if (error) return setMensaje(error.message)
    setAutos((prev) => prev.filter((a) => a.id !== id))
  }

  const tarjetas = [
    { t: 'Usuarios', n: perfiles.length },
    { t: 'Autos', n: autos.length },
    { t: 'Reservas', n: totalRentas },
  ]

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Panel de administración</h1>
      <p className="text-neutral-400 mb-6">
        Tu cuenta: {miRol ? nombreRol[miRol] : '...'}
      </p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {tarjetas.map((c) => (
          <div key={c.t} className="p-5 rounded-xl border border-white/15 bg-black">
            <p className="text-neutral-400 text-sm">{c.t}</p>
            <p className="text-3xl font-bold">{c.n}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        {(['usuarios', 'autos'] as const).map((v) => (
          <button key={v} onClick={() => setVista(v)}
            className={`px-4 py-2 rounded capitalize ${
              vista === v ? 'bg-brand border border-white/20' : 'bg-neutral-800'
            }`}>
            {v}
          </button>
        ))}
      </div>

      {mensaje && <p className="mb-4 text-sm text-red-400">{mensaje}</p>}

      {vista === 'usuarios' ? (
        <div className="flex flex-col gap-3">
          {perfiles.map((p) => (
            <div key={p.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/15 bg-black">
              <div className="min-w-0">
                <p className="truncate">{p.email}</p>
                <p className="text-sm text-neutral-400">{nombreRol[p.rol]}</p>
              </div>
              <select
                value={p.rol}
                disabled={!puedeEditar(p)}
                onChange={(e) => cambiarRol(p.id, e.target.value as Rol)}
                className="p-2 rounded bg-zinc-950 text-white border border-neutral-700 disabled:opacity-40">
                {opciones(p).map((r) => (
                  <option key={r} value={r}>{nombreRol[r]}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {autos.length === 0 && <p>No hay autos publicados.</p>}
          {autos.map((a) => (
            <div key={a.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/15 bg-black">
              <div className="min-w-0">
                <p className="font-semibold">{a.marca} {a.modelo} · {a.anio}</p>
                <p className="text-sm text-neutral-400 truncate">
                  ${a.precio_dia.toLocaleString()} / día · {correo(a.user_id)}
                </p>
              </div>
              <button onClick={() => borrarAuto(a.id)}
                className="px-3 py-1 rounded bg-red-600 text-white text-sm">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}