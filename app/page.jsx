import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const revalidate = 0 

export default async function Home() {
  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', 1)
    .single()

  const { data: menuItems, error: menuError } = await supabase
    .from('menu')
    .select('*')
    .eq('restaurant_id', 1)

  if (restError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-sm border border-amber-100">
          <p className="text-4xl">👨‍🍳</p>
          <h2 className="text-xl font-bold mt-4 text-amber-900">Impastando il sito...</h2>
          <p className="text-sm text-amber-700/75 mt-1">Connessione a Supabase in corso.</p>
        </div>
      </div>
    )
  }

  const categories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : []

  return (
    <>
      {/* Importiamo Tailwind e i Font d'impatto direttamente nell'head */}
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-stone-50 text-stone-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
        
        {/* HERO HEADER: Immagine di sfondo vera che evoca il forno a legna */}
        <header className="relative bg-black text-white py-32 px-6 text-center bg-cover bg-center" style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(28, 25, 23, 0.95)), url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80')` 
        }}>
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
              Pizzeria Tradizionale
            </span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              {restaurant.name}
            </h1>
            <p className="text-amber-100/80 text-lg italic max-w-lg mx-auto font-light">
              "{restaurant.description}"
            </p>
            
            {/* Info Badges Rustici */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center text-sm">
              <span className="bg-stone-900/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-stone-700 text-stone-200 shadow-lg">
                📍 {restaurant.address}
              </span>
              <a href={`https://wa.me/${restaurant.phone_whatsapp}`} target="_blank" rel="noopener noreferrer" 
                 className="bg-emerald-600 hover:bg-emerald-700 transition px-5 py-2 rounded-xl text-white font-bold shadow-lg flex items-center gap-2 transform hover:scale-105 duration-200">
                🟢 Ordina subito su WhatsApp
              </a>
            </div>
          </div>
        </header>

        {/* IL MENU DEL RISTORANTE */}
        <main className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight inline-block relative pb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              La Nostra Carta
              <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-amber-500 rounded-full"></div>
            </h2>
          </div>

          {menuError || !menuItems || menuItems.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 shadow-sm text-stone-500">
              <p className="text-lg font-medium">Il forno si sta scaldando, i condimenti arrivano a breve!</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category} className="mb-14">
                {/* Titolo della Categoria elegante */}
                <h3 className="text-xl font-bold text-amber-800 tracking-wide uppercase mb-6 border-b border-stone-200 pb-2 flex items-center gap-2">
                  <span>✨</span> {category}
                </h3>

                {/* Lista Pizze stile Trattoria Moderna */}
                <div className="grid gap-6 md:grid-cols-2">
                  {menuItems
                    .filter(item => item.category === category)
                    .map((item) => (
                      <div key={item.id} className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-baseline gap-4">
                            <h4 className="text-lg font-bold text-stone-900 capitalize">
                              {item.name}
                            </h4>
                            <span className="text-amber-600 font-extrabold text-lg whitespace-nowrap bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                              {parseFloat(item.price).toFixed(2)} €
                            </span>
                          </div>
                          <p className="text-stone-500 text-sm mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </main>

        {/* Footer Caldo e Accogliente */}
        <footer className="text-center py-12 text-stone-400 text-sm border-t border-stone-200 bg-stone-900 text-stone-400">
          <p>© 2026 <span className="text-white font-medium">{restaurant.name}</span> • Impasti ad alta idratazione</p>
          <p className="text-xs text-stone-500 mt-2">Ingredienti freschi e selezionati ogni giorno.</p>
        </footer>

      </div>
    </>
  )
}
