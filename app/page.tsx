import Link from 'next/link'

const puntos = [
  'Anticipo de solo el 20%',
  'Seguro en cada renta',
  'Chat directo con el propietario',
]

const ventajas = [
  {
    titulo: 'Publica en minutos',
    texto: 'Sube las fotos de tu auto y listo, sin trámites complicados.',
  },
  {
    titulo: 'Chat en tiempo real',
    texto: 'Habla directo con propietarios y clientes dentro de la plataforma.',
  },
  {
    titulo: 'Cuentas seguras',
    texto: 'Registro con correo y contraseña, tus datos protegidos.',
  },
]

export default function Home() {
  return (
    <main className="bg-white">
      <section className="flex flex-col items-center text-center gap-8 px-6 pt-24 pb-16">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl">
          Renta autos por día,{' '}
          <span className="text-brand">sin complicaciones.</span>
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl">
          Elige tu auto, reserva tus fechas en el calendario y platica directo con el
          propietario.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/autos"
            className="px-8 py-4 rounded-full bg-brand text-white font-semibold text-lg">
            Ver autos
          </Link>
          <Link href="/publicar"
            className="px-8 py-4 rounded-full bg-white text-neutral-900 font-semibold text-lg border border-neutral-300">
            Publicar mi auto
          </Link>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-neutral-800">
          {puntos.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span className="text-brand">✓</span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3 px-6 pb-24">
        {ventajas.map((v) => (
          <div key={v.titulo} className="p-6 rounded-2xl border border-neutral-200 bg-white">
            <h3 className="text-lg font-semibold mb-2">{v.titulo}</h3>
            <p className="text-neutral-600 text-sm">{v.texto}</p>
          </div>
        ))}
      </section>
    </main>
  )
}