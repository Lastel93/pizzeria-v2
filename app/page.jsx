import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function generateMetadata() {
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, description')
    .eq('id', 1)
    .single()

  return {
    title: restaurant ? `${restaurant.name} - Menu Tradizionale` : 'Menu Digitale',
    description: restaurant ? restaurant.description : 'Sfoglia il nostro menu',
  }
}

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
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf7]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-stone-200 max-w-sm">
          <p className="text-4xl animate-pulse">👨‍🍳</p>
          <h2 className="text-xl font-bold mt-4 text-stone-800 font-serif">Preparando il forno a legna...</h2>
        </div>
      </div>
    )
  }

  // Ordine forzato delle categorie per avere Pizze -> Bibite -> Birre
  const sortedCategories = ['Pizze Classiche', 'Pizze Speciali', 'Bibite', 'Birre Artigianali']
  const existingCategories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : []
  const categories = sortedCategories.filter(cat => existingCategories.includes(cat))
    .concat(existingCategories.filter(cat => !sortedCategories.includes(cat)))

  // Funzione helper per assegnare l'immagine di sfondo corretta alla sezione
  const getSectionBackground = (category) => {
    if (category.toLowerCase().includes('pizza')) {
      return "linear-gradient(to bottom, rgba(28, 45, 33, 0.3), rgba(253, 252, 247, 1)), url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80')"
    }
    if (category.toLowerCase().includes('bibit')) {
      return "linear-gradient(to bottom, rgba(28, 45, 33, 0.2), rgba(253, 252, 247, 1)), url('https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1000&q=80')"
    }
    if (category.toLowerCase().includes('birr')) {
      return "linear-gradient(to bottom, rgba(28, 45, 33, 0.2), rgba(253, 252, 247, 1)), url('https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=1000&q=80')"
    }
    return 'none'
  }

  return (
    <div className="min-h-screen bg-[#fdfcf7] text-[#1c2d21] pb-24">
      
      {/* HERO HEADER: Atmosfera del forno maiolicato e fuoco vivo */}
      <header 
        className="relative bg-stone-950 text-white py-32 px-4 text-center bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(28, 45, 33, 0.85)), url('https://images.unsplash.com/photo-1541014741259-df549fa01a74?auto=format&fit=crop&w=1200&q=80')` 
        }}
      >
        <div className="max-w-2xl mx-auto relative z-10">
          <span className="inline-block bg-[#b91c1c]/20 text-red-300 border border-[#b91c1c]/40 px-4 py-1 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">
            🍕 Forno a Legna & Tradizione
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 font-serif text-[#fdfcf7]">
            {restaurant.name}
          </h1>
          <p className="text-stone-200 text-base md:text-lg italic max-w-lg mx-auto font-light">
            "{restaurant.description}"
          </p>
          
          <div className="mt-6 text-sm inline-flex items-center gap-2 bg-[#1c2d21]/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-stone-700/50 text-stone-200">
            📍 {restaurant.address}
          </div>
        </div>
      </header>

      {/* NAVIGAZIONE INTERNA (STICKY ANCHORS) per saltare alle sezioni */}
      <div className="sticky top-0 z-50 bg-[#fdfcf7]/95 backdrop-blur-md border-b border-stone-200 py-3 shadow-sm px-4 overflow-x-auto whitespace-nowrap flex justify-center gap-2">
        {categories.map((category) => (
          <a 
            key={category} 
            href={`#${category.replace(/\s+/g, '-').toLowerCase()}`}
            className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#f5f2e9] text-[#1c2d21] border border-stone-200 hover:border-[#b91c1c] hover:text-[#b91c1c] transition-all"
          >
            {category}
          </a>
        ))}
      </div>

      {/* CORPO DEL MENU */}
      <main className="max-w-4xl mx-auto px-4 pt-12">
        {menuError || !menuItems || menuItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 shadow-sm text-stone-500 font-serif">
            <p>Il mastro pizzaiolo sta preparando gli ingredienti.</p>
          </div>
        ) : (
          categories.map((category, index) => (
            <div key={category} id={category.replace(/\s+/g, '-').toLowerCase()} className="mb-20 scroll-mt-20">
              
              {/* DIVISORE DI SEZIONE GEOMETRICO STILE TOVAGLIA A SCACCHI (Solo prima delle bibite) */}
              {index > 0 && category.toLowerCase().includes('bibit') && (
                <div className="w-full h-3 mb-16 flex overflow-hidden rounded-full opacity-80" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #b91c1c, #b91c1c 10px, #fdfcf7 10px, #fdfcf7 20px)' }} />
              )}

              {/* TITOLO DI CATEGORIA IMPATTANTE CON IMMAGINE SENSORIALE SOTTO */}
              <div 
                className="w-full rounded-3xl p-8 mb-8 bg-cover bg-center flex items-end min-h-[160px] shadow-sm relative border border-stone-200/40"
                style={{ backgroundImage: getSectionBackground(category) }}
              >
                <h3 className="text-2xl md:text-3xl font-black tracking-tight font-serif text-[#1c2d21] bg-[#fdfcf7] px-6 py-2 rounded-2xl shadow-sm border border-stone-100">
                  {category}
                </h3>
              </div>

              {/* LISTA DELLE CARD PIZZE / BEVANDE PULITE COLOR PERGAMENA */}
              <div className="grid gap-4 md:grid-cols-2">
                {menuItems
                  .filter(item => item.category === category)
                  .map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-[0_2px_4px_rgba(28,45,33,0.02)] flex flex-col justify-between hover:border-amber-900/30 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-baseline gap-4">
                          <h4 className="text-base md:text-lg font-bold text-stone-900 capitalize font-sans tracking-tight">
                            {item.name}
                          </h4>
                          <span className="text-[#b91c1c] font-black text-base whitespace-nowrap bg-[#fdfcf7] px-3 py-1 rounded-xl border border-stone-200/60">
                            {parseFloat(item.price).toFixed(2)} €
                          </span>
                        </div>
                        <p className="text-stone-500 text-xs md:text-sm mt-1.5 leading-relaxed font-light">
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

      {/* BOTTOM ACTION FLOATING BAR (Fissa in basso per simulare l'ordine futuro) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#fdfcf7]/90 backdrop-blur-md border-t border-stone-200/80 z-50 flex justify-center">
        <a 
          href={`https://wa.me/${restaurant.phone_whatsapp}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-sm md:text-base tracking-wide"
        >
          <span>🟢</span> Ordina su WhatsApp (Chat Diretta)
        </a>
      </div>

    </div>
  )
}
