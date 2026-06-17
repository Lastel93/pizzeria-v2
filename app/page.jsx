'use client' // Forza la pagina a girare nel browser, risolvendo il fetch failed del server

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iwszqtovnwtzbnylhpd.supabase.co'
// ⚠️ INCOLLA QUI LA TUA CHIAVE REALE sb_publishable_...
const supabaseAnonKey = 'sb_publishable_CXj-Borhy-db_Rh30N6wig_rAabBtgm' 
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [restaurant, setRestaurant] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Carica Ristorante
        const { data: restData, error: restErr } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', 1)
          .single()

        if (restErr) throw restErr
        setRestaurant(restData)

        // 2. Carica Menu
        const { data: menuData, error: menuErr } = await supabase
          .from('menu')
          .select('*')
          .eq('restaurant_id', 1)

        if (menuErr) throw menuErr
        setMenuItems(menuData || [])
      } catch (err) {
        console.error(err)
        setError(err.message || 'Errore di connessione')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#4b5563', fontWeight: 'bold' }}>🍕 Sfornando il menu...</p>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', color: '#ef4444', fontFamily: 'sans-serif', padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '500px' }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>Impossibile caricare i dati</p>
          <p style={{ fontSize: '14px', color: '#4b5563' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', color: '#1f2937', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      {/* Header */}
      <header style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '48px 24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{restaurant.name}</h1>
        <p style={{ marginTop: '8px', marginBottom: 0, color: '#fee2e2', fontStyle: 'italic' }}>{restaurant.description}</p>
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#fca5a5' }}>
          📍 {restaurant.address} • 📞 +{restaurant.phone_whatsapp}
        </div>
      </header>

      {/* Menu */}
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #dc2626', paddingBottom: '8px', maxWidth: '200px', marginLeft: 'auto', marginRight: 'auto' }}>
          Il Nostro Menu
        </h2>

        {menuItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', backgroundColor: '#ffffff', padding: '32px', borderRadius: '8px' }}>
            Non ci sono ancora pizze nel menu.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {menuItems.map((item) => (
              <div key={item.id} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #f3f4f6' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{item.name}</h3>
                    <span style={{ fontSize: '12px', backgroundColor: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px' }}>
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
