export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-stone-50">
      {/* Sidebar: nascosta su mobile, visibile su desktop */}
      <aside className="hidden md:flex w-64 bg-[#1C2D21] text-white p-6 flex-col">
        <h2 className="text-xl font-black mb-8">SmartMenu.</h2>
        <nav className="space-y-4">
          <a href="/admin/dashboard" className="block p-2 rounded hover:bg-[#2d4a36]">Dashboard</a>
          <a href="/admin/menu" className="block p-2 rounded hover:bg-[#2d4a36]">Il Mio Menu</a>
        </nav>
      </aside>
      
      {/* Contenuto principale */}
      <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
