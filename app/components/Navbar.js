"use client" ;
import Link from "next/link";

export default function Navbar() {
  return (
    
    <nav className="w-full bg-[#1CF094] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
        
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-800">
              Ceci, Jess, Isa
            </Link>
          </div>
        <div className="hidden lg:flex flex-1 justify-center">
          <div className="hidden lg:flex items-center space-x-4">
            <Link href="/" className="rounded-md bg-black/10 px-3 py-2 text-sm font-medium text-gray-900">
              Inicio
            </Link>
            <Link href="/usuario" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-black/10">
              Usuario
            </Link>
            <Link href="/faq" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-black/10">
              FAQ
            </Link>
          </div>
        </div>
          <div className="hidden md:flex items-center">
            <form className="flex items-center border pl-4 gap-2 bg-white border-gray-500/30 h-[46px] rounded-full overflow-hidden max-w-xs w-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#6B7280" className="flex-shrink-0">
                <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              <input 
                type="search" 
                placeholder="Buscar..." 
                className="w-full h-full outline-none text-sm text-gray-500 bg-transparent placeholder-gray-400 pr-2" 
              />
              <button type="submit" className="bg-[#7d5a50] px-4 h-full text-sm text-white hover:opacity-90 transition">
                Search
              </button>
            </form>
          </div>

        </div>
      </div>
    </nav>
  );
}