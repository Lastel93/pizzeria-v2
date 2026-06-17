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
    title: restaurant ? `${restaurant.name} - La Tradizione` : 'Menu',
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <p className="font-serif italic text-stone-500">Preparando il forno...</p>
      </div>
    )
  }

  const sortedCategories = ['Pizze Classiche', 'Pizze Speciali', 'Bibite', 'Birre Artigianali']
  const existingCategories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : []
  const categories = sortedCategories.filter(cat => existingCategories.includes(cat))
    .concat(existingCategories.filter(cat => !sortedCategories.includes(cat)))

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-32">
      
      {/* HEADER ELEGANTE: Contrasto profondo, pulito e tipografia imponente */}
      <header className="bg-[#1C2D21] text-[#FAF8F5] pt-24 pb-20 px-4 text-center border-b-4 border-[#B91C1C]">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-[#B91C1C] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-6 shadow-sm">
            🔥 Forno a Legna & Tradizione
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 font-serif text-white">
            {restaurant.name}
          </h1>
          <p className="text-stone-300 text-sm md:text-base italic max-w-md mx-auto font-light leading-relaxed">
            "{restaurant.description}"
          </p>
          <div className="mt-8 inline-flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl text-xs text-stone-200 tracking-wide font-mono">
            📍 {restaurant.address}
          </div>
        </div>
      </header>

      {/* NAVIGAZIONE STICKY: Bottoni minimali, puliti e ad alto contrasto */}
      <div className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 py-3 shadow-sm px-4 overflow-x-auto whitespace-nowrap flex justify-start md:justify-center gap-2">
        {categories.map((category) => (
          <a 
            key={category} 
            href={`#${category.replace(/\s+/g, '-').toLowerCase()}`}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-[#1C2D21] border border-stone-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] active:bg-[#1C2D21] active:text-white transition-all"
          >
            {category}
          </a>
        ))}
      </div>

      {/* CONTENUTO DEL MENU */}
      <main className="max-w-3xl mx-auto px-4 pt-16">
        {menuError || !menuItems || menuItems.length === 0 ? (
          <p className="text-center text-stone-400 font-serif italic">Nessun piatto disponibile.</p>
        ) : (
          categories.map((category) => (
            <div key={category} id={category.replace(/\s+/g, '-').toLowerCase()} className="mb-16 scroll-mt-24">
              
              {/* TITOLO CATEGORIA RETRO */}
              <div className="border-b-2 border-[#1C2D21] pb-2 mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black font-serif text-[#1C2D21] tracking-tight">
                  {category}
                </h3>
                <span className="text-xs text-[#B91C1C] font-mono tracking-widest uppercase font-bold">● Italia</span>
              </div>

              {/* LISTA PIATTI STILE CARTA PERGAMENA TRADIZIONALE */}
              <div className="grid gap-4">
                {menuItems
                  .filter(item => item.category === category)
                  .map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-[#1C2D21]/30 transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="text-base md:text-lg font-bold text-stone-900 font-sans tracking-tight capitalize">
                            {item.name}
                          </h4>
                          <p className="text-stone-500 text-xs md:text-sm mt-1 leading-relaxed font-light max-w-xl">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-[#B91C1C] font-mono font-black text-base md:text-lg whitespace-nowrap bg-[#FAF8F5] px-3 py-1 rounded-xl border border-stone-100">
                          {parseFloat(item.price).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </main>

      {/* FLOATING ACTION BAR: Bottone per ordinare pulito, moderno e invitante */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAF8F5]/80 backdrop-blur-md border-t border-stone-200/60 z-50 flex justify-center">
        <a 
          href={`https://wa.me/${restaurant.phone_whatsapp}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full max-w-md bg-[#1C2D21] hover:bg-[#253f2e] active:scale-[0.98] transition-all text-white font-bold py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-sm tracking-wide border border-black/10"
        >
          <span className="text-base">🟢</span> Ordina via WhatsApp (Invia Messaggio)
        </a>
      </div>

    </div>
  )
}
