import { createClient } from '@supabase/supabase-js'

// Inizializzazione tramite l'integrazione ufficiale
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '32px', backgroundColor: '#1e293b', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', maxWidth: '400px', border: '1px solid #334155' }}>
          <span style={{ fontSize: '40px' }}>🍕</span>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '16px', marginBottom: '8px', color: '#f43f5e' }}>Pizzeria in preparazione</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>Connessione al database in corso...</p>
        </div>
      </div>
    )
  }

  // Raggruppiamo le pizze/piatti per categoria per un menu super organizzato
  const categories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : []

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0 }}>
      
      {/* Hero Header Moderno con sfumatura radicale */}
      <header style={{ 
        position: 'relative', 
        padding: '80px 24px', 
        textAlign: 'center', 
        backgroundImage: 'linear-gradient(to bottom, #1e1b4b, #0f172a)',
        borderBottom: '1px solid #1e293b',
        overflow: 'hidden'
      }}>
        {/* Cerchio di luce soffusa sullo sfondo */}
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translate(-50%, 0)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            PIZZERIA ARTIGIANALE
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', margin: 0, letterSpacing: '-0.025em', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {restaurant.name}
          </h1>
          <p style={{ marginTop: '12px', marginBottom: 0, color: '#94a3b8', fontSize: '16px', lineHeight: '1.6', fontWeight: '400' }}>
            {restaurant.description}
          </p>
          
          {/* Info Badge */}
          <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', fontSize: '14px' }}>
            <span style={{ backgroundColor: '#1e293b', padding: '8px 16px', borderRadius: '12px', border: '1px solid #334155', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📍 {restaurant.address}
            </span>
            <a href={`https://wa.me/${restaurant.phone_whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#22c55e', padding: '8px 16px', borderRadius: '12px', color: '#ffffff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(34,197,94,0.2)' }}>
              📞 Ordina su WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Corpo Principale del Menu */}
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
        
        {menuError || !menuItems || menuItems.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', backgroundColor: '#1e293b', padding: '48px', borderRadius: '20px', border: '1px solid #334155' }}>
            <span style={{ fontSize: '32px' }}>👨‍🍳</span>
            <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '16px' }}>Stiamo aggiornando l'impasto. Torna tra pochissimo!</p>
          </div>
        ) : (
          // Organizzazione per Categorie (es. Pizze Classiche, Pizze Speciali, Bevande)
          categories.map((category) => (
            <div key={category} style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '700', margin: 0, color: '#f8fafc', textTransform: 'capitalize', letterSpacing: '-0.02em' }}>
                  {category}
                </h2>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#1e293b' }} />
              </div>

              {/* Griglia delle Pizze */}
              <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {menuItems
                  .filter(item => item.category === category)
                  .map((item) => (
                    <div key={item.id} style={{ 
                      backgroundColor: '#1e293b', 
                      padding: '24px', 
                      borderRadius: '16px', 
                      border: '1px solid #334155',
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                    }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                            {item.name}
                          </h3>
                          <span style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                            color: '#f87171', 
                            fontWeight: '700', 
                            padding: '4px 12px', 
                            borderRadius: '8px', 
                            fontSize: '15px', 
                            whiteSpace: 'nowrap',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>
                            {parseFloat(item.price).toFixed(2)} €
                          </span>
                        </div>
                        <p style={{ color: '#94a3b8', marginTop: '8px', marginBottom: 0, fontSize: '14px', lineHeight: '1.5' }}>
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

      {/* Footer Elegante */}
      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '13px', borderTop: '1px solid #1e293b', marginTop: '60px', backgroundColor: '#0b0f19' }}>
        <p style={{ margin: 0 }}>© 2026 {restaurant.name} • Tutti i diritti riservati.</p>
        <p style={{ margin: '6px 0 0 0', color: '#475569' }}>Realizzato con Next.js & Supabase Database.</p>
      </footer>
    </div>
  )
}
