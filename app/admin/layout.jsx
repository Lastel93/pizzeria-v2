import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-stone-50 font-sans">
      
      {/* Sidebar Laterale */}
      <aside className="w-64 bg-[#1C2D21] text-white flex flex-col shadow-xl z-10">
        <div className="p-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">SmartMenu</h2>
          <p className="text-sm text-stone-400 mt-1">Area Ristoratore</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2">
          {/* Link Attivo */}
          <Link href="/admin/dashboard" className="block px-4 py-3 rounded-lg bg-[#2A3F2F] text-white font-medium hover:bg-[#38523D] transition">
            Dashboard
          </Link>
          
          {/* Link Futuri */}
          <Link href="/admin/menu" className="block px-4 py-3 rounded-lg text-stone-300 font-medium hover:bg-[#2A3F2F] hover:text-white transition">
            Gestione Menu
          </Link>
          <Link href="/admin/impostazioni" className="block px-4 py-3 rounded-lg text-stone-300 font-medium hover:bg-[#2A3F2F] hover:text-white transition">
            Impostazioni
          </Link>
        </nav>
      </aside>

      {/* Contenuto Principale Dinamico */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
