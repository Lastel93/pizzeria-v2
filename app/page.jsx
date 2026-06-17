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
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf7]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-sm border border-stone-100">
          <p className="text-4xl">👨‍🍳</p>
          <h2 className="text-xl font-bold mt-4 text-stone-800">Impastando il menu...</h2>
        </div>
      </div>
    )
  }

  const categories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : []

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-stone-800">
      
      {/* HERO HEADER: Sfondo immagine perfetto con testi BIANCHI ben contrastati */}
      <header 
        className="relative bg-stone-950 text-white py-36 px-6 text-center bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.45), rgba(12, 10, 9, 0.9)), url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80')` 
        }}
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
            Pizzeria Artigianale
          </span>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 font-serif">
            {restaurant.name}
          </h1>
          <p className="text-stone-300 text-lg italic max-w-lg mx-auto font-light leading-relaxed">
            "{restaurant.description}"
          </p>
          
          {/* Pulsanti Info e WhatsApp coordinati */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm font-medium">
            <span className="bg-stone-900/90 backdrop-blur-sm px-5 py-2.5 rounded-xl border border-stone-800 text-stone-200 shadow-md">
              📍 {restaurant.address}
            </span>
            <a 
              href={`https://wa.me/${restaurant.phone_whatsapp}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors px-6 py-2.5 rounded-xl text-white font-bold shadow-md flex items-center gap-2"
            >
              🟢 Ordina su WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* SEZIONE CARTA / MENU */}
      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight inline-block relative pb-4 font-serif">
            Le Nostre Pizze
            <div className="absolute bottom-0 left-1/3 right-1/3 h-1 bg-amber-600 rounded-full"></div>
          </h2>
        </div>

        {menuError || !menuItems || menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 shadow-sm">
            <p>Il menu è in fase di aggiornamento.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category} className="mb-16">
              {/* Categoria del Menu stile Trattoria Italiana */}
              <h3 className="text-lg font-bold text-amber-900 tracking-wider uppercase mb-8 border-b border-stone-200 pb-3 flex items-center gap-2">
                <span className="text-amber-600">✦</span> {category}
              </h3>

              {/* Griglia delle Card Pizze bianche/pulite su sfondo panna */}
              <div className="grid gap-6 md:grid-cols-2">
                {menuItems
                  .filter(item => item.category === category)
                  .map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline gap-4">
                          <h4 className="text-lg font-bold text-stone-900 capitalize font-sans">
                            {item.name}
                          </h4>
                          <span className="text-amber-700 font-extrabold text-base whitespace-nowrap bg-amber-50/60 px-3 py-1 rounded-xl border border-amber-100/70">
                            {parseFloat(item.price).toFixed(2)} €
                          </span>
                        </div>
                        <p className="text-stone-500 text-sm mt-2 leading-relaxed font-light">
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

      {/* Footer caldo */}
      <footer className="text-center py-14 bg-stone-950 text-stone-400 text-sm border-t border-stone-900">
        <p>© 2026 <span className="text-white font-medium">{restaurant.name}</span> • Cotta in forno a legna</p>
        <p className="text-xs text-stone-600 mt-2">Selezioniamo solo ingredienti a marchio DOP e IGP.</p>
      </footer>

    </div>
  )
}
