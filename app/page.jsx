import { createClient } from '@supabase/supabase-js'

// 1. Inizializzazione dinamica tramite le variabili dell'integrazione ufficiale
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Forza Next.js a non usare dati vecchi in cache (Server-Side puro)
export const revalidate = 0 

export default async function Home() {
  // 2. Recupero del ristorante con ID 1
  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', 1)
    .single()

  // 3. Recupero delle pizze associate al ristorante 1
  const { data: menuItems, error: menuError } = await supabase
    .from('menu')
    .select('*')
    .eq('restaurant_id', 1)

  // Schermata di errore se la connessione o i dati falliscono
  if (restError || !restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', color: '#ef4444', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>Pizzeria in preparazione...</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Se vedi questa schermata, assicurati di aver fatto il <strong>Redeploy</strong> su Vercel dopo aver rimosso le vecchie chiavi manuali.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', color: '#1f2937', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      {/* Header / Insegna del Ristorante */}
      <header style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '48px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{restaurant.name}</h1>
        <p style={{ marginTop: '8px', marginBottom: 0, color: '#fee2e2', fontStyle: 'italic' }}>{restaurant.description}</p>
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#fca5a5' }}>
          📍 {restaurant.address} • 📞 +{restaurant.phone_whatsapp}
        </div>
      </header>

      {/* Sezione Menu */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #dc2626', paddingBottom: '8px', maxWidth: '200px', marginLeft: 'auto', marginRight: 'auto' }}>
          Il Nostro Menu
        </h2>

        {menuError || !menuItems || menuItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', backgroundColor: '#ffffff', padding: '32px', borderRadius: '8px' }}>
            Non ci sono ancora pizze disponibili nel menu.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {menuItems.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{item.name}</h3>
                    <span style={{ fontSize: '12px', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize' }}>
                      {item.category}
                    </span>
                  </div>
                  <p style={{ color: '#4b5563', marginTop: '4px', marginBottom: 0, fontSize: '14px' }}>{item.description}</p>
                </div>
                <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {parseFloat(item.price).toFixed(2)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '32px 16px', color: '#9ca3af', fontSize: '12px', borderTop: '1px solid #e5e7eb', marginTop: '48px' }}>
        © 2026 {restaurant.name}. Powered by Next.js & Supabase.
      </footer>
    </div>
  )
}
