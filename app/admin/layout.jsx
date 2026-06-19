'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname(); // Intercetta la pagina attuale

  return (
    <div className="flex min-h-screen bg-stone-50 font-sans">
      
      {/* Sidebar Laterale */}
      <aside className="w-64 bg-[#1C2D21] text-white flex flex-col shadow-xl z-10">
        <div className="p-8">
          <h2 className="text-2xl font-bold tracking-tight">SmartMenu</h2>
          <p className="text-sm text-stone-400 mt-1">Area Ristoratore</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2">
          <Link 
            href="/admin/dashboard" 
            className={`block px-4 py-3 rounded-lg font-medium transition ${
              pathname === '/admin/dashboard' 
                ? 'bg-[#2A3F2F] text-white shadow-inner' 
                : 'text-stone-300 hover:bg-[#2A3F2F] hover:text-white'
            }`}
          >
            Dashboard
          </Link>
          
          <Link 
            href="/admin/menu" 
            className={`block px-4 py-3 rounded-lg font-medium transition ${
              pathname === '/admin/menu' 
                ? 'bg-[#2A3F2F] text-white shadow-inner' 
                : 'text-stone-300 hover:bg-[#2A3F2F] hover:text-white'
            }`}
          >
            Il Mio Menu
          </Link>
        </nav>
      </aside>

      {/* Contenuto Principale */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
