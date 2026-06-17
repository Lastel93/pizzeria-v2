import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const revalidate = 0 

export default async function Home() {
  // Prendiamo il ristorante con ID 1 (Pizzeria dai Burini)
  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', 1)
    .single()

  // Prendiamo i piatti del menu associati
  const { data: menuItems, error: menuError } = await supabase
    .from('menu')
    .select('*')
    .eq('restaurant_id', 1)

  if (restError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <p className="text-red-500 font-semibold mb-2">Errore nel caricamento del ristorante.</p>
          <p className="text-xs text-gray-400">Verifica di aver disattivato l'RLS su Supabase per le tabelle 'restaurants' e 'menu'.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-red-600 text-white py-12 text-center shadow-md">
        <h1 className="text-4xl font-bold tracking-tight">{restaurant.name}</h1>
        <p className="mt-2 text-red-100 italic">{restaurant.description}</p>
        <div className="mt-4 text-sm text-red-200">
          📍 {restaurant.address} • 📞 +{restaurant.phone_whatsapp}
        </div>
      </header>

      {/* Menu */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8 border-b-2 border-red-500 pb-2 max-w-xs mx-auto">
          Il Nostro Menu
        </h2>

        {menuError || !menuItems || menuItems.length === 0 ? (
          <p className="text-center text-gray-500 bg-white p-8 rounded-lg shadow-sm">
            Non ci sono ancora pizze nel menu o l'accesso è bloccato dall'RLS.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
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

      <footer className="text-center py-8 text-gray-400 text-xs border-t border-gray-200 mt-12">
        © 2026 {restaurant.name}. Powered by Next.js & Supabase.
      </footer>
    </div>
  )
}
