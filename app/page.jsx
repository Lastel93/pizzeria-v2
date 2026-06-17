import { createClient } from '@supabase/supabase-js'

// Inizializziamo il client di Supabase usando le chiavi salvate su Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const revalidate = 0 // Dice a Next.js di ricaricare i dati freschi a ogni visita

export default async function Home() {
  // 1. Prendiamo i dati del ristorante (prendiamo il primo disponibile)
  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .select('*')
    .single()

  // 2. Prendiamo tutti i piatti del menu collegati a questo ristorante
  const { data: menuItems, error: menuError } = await supabase
    .from('menu')
    .select('*')
    .eq('restaurant_id', restaurant?.id)

  if (restError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500 font-semibold">Errore nel caricamento del ristorante o nessun ristorante trovato.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header con i dati del ristorante dal Database */}
      <header className="bg-red-600 text-white py-12 text-center shadow-md">
        <h1 className="text-4xl font-bold tracking-tight">{restaurant.name}</h1>
        <p className="mt-2 text-red-100 italic">{restaurant.description || 'La vera pizza italiana'}</p>
        <div className="mt-4 text-sm text-red-200">
          📍 {restaurant.address} • 📞 {restaurant.phone}
        </div>
      </header>

      {/* Menu delle Pizze */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8 border-b-2 border-red-500 pb-2 max-w-xs mx-auto">
          Il Nostro Menu
        </h2>

        {menuError || !menuItems || menuItems.length === 0 ? (
          <p className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-sm">
            Non ci sono ancora pizze nel menu. Aggiungine una su Supabase!
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                </div>
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm shrink-0">
                  {parseFloat(item.price).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-xs border-t border-gray-200 mt-12">
        © 2026 {restaurant.name}. Powered by Next.js & Supabase.
      </footer>
    </div>
  )
}
