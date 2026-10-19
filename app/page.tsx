import Link from 'next/link'

const ventajas = [
  { titulo: 'Publica en minutos', texto: 'Sube las fotos de tu auto y listo, sin trámites complicados.' },
  { titulo: 'Chat en tiempo real', texto: 'Habla directo con propietarios y clientes dentro de la plataforma.' },
  { titulo: 'Cuentas seguras', texto: 'Registro con correo y contraseña, tus datos protegidos.' },
]

export default function Home() {
  return (
    <main>
      <section className="flex flex-col items-center text-center gap-6 px-6 py-28 bg-gradient-to-b from-purple-950 to-black">
        <span className="text-sm uppercase tracking-widest text-brand">Renta de autos</span>
        <h1 className="text-5xl sm:text-6xl font-extrabold max-w-3xl">
          	Renta el auto que necesitas en <span className="text-brand">Drivana</span>
        </h1>
        <p className="text-lg text-neutral-400 max-w-xl">
          Renta autos de forma fácil y segura, y platica directo con el propietario.
        </p>
        <div className="flex gap-4">
          <Link href="/autos" className="px-6 py-3 rounded-lg bg-violet-600 text-white font-semibold">
            Ver autos
          </Link>
          <Link href="/publicar" className="px-6 py-3 rounded-lg bg-white text-black font-semibold">
            Publicar mi auto
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3 px-6 py-16">
        {ventajas.map((v) => (
          <div key={v.titulo} className="p-6 rounded-xl border border-neutral-800 bg-zinc-950">
            <h3 className="text-lg font-semibold text-brand mb-2">{v.titulo}</h3>
            <p className="text-neutral-400 text-sm">{v.texto}</p>
          </div>
        ))}
      </section>
    </main>
  )
}