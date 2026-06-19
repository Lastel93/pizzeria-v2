import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between font-sans">
      <nav className="max-w-6xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-black tracking-tight text-[#1C2D21]">
          SmartMenu<span className="text-emerald-600">.</span>
        </div>
        <Link 
          href="/admin/dashboard" 
          className="px-5 py-2.5 bg-[#1C2D21] text-white text-sm font-bold rounded-xl hover:bg-[#2d4a36] transition shadow-sm"
        >
          Area Ristoratore →
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto w-full px-6 py-20 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
          🚀 Menu digitali istantanei con IA
        </span>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-stone-900 leading-none max-w-2xl">
          Fotografa il tuo menu cartaceo. <br />
          <span className="text-emerald-600">L'IA fa il resto.</span>
        </h1>
        <p className="text-lg text-stone-500 max-w-xl font-medium">
          Carica o scatta una foto al listino del tuo locale. Il nostro sistema intelligente estrae piatti, ingredienti e prezzi, creando un menu digitale interattivo in meno di 10 secondi.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
          <Link 
            href="/admin/dashboard" 
            className="px-8 py-4 bg-[#1C2D21] text-white font-bold rounded-xl text-lg hover:bg-[#2d4a36] transition shadow-md"
          >
            Configura il tuo Locale
          </Link>
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs font-semibold text-stone-400">
        © {new Date().getFullYear()} SmartMenu. Tutti i diritti riservati.
      </footer>
    </div>
  );
}
