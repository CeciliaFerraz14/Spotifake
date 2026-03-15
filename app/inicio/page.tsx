import Image from "next/image";


export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-star  p-8 gap-8">
      <img className="logoPrincipal"
        src="/images/logo.png" 
        alt="Logo" 
        width={400} 
        height={400}
      />
      <h1 className="text-4xl font-bold">Bienvenidos</h1>
      <div className="container1">
        <p>Os damos la bienvenida a SpotiFake, una plataforma de música independiente para artistas emergentes.</p>
      </div>
    </main>
  )
}