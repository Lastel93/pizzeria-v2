import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iwszqtovnwtzbnylhpd.supabase.co'
// Ricordati di rimettere la tua chiave reale qui sotto!
const supabaseAnonKey = 'sb_publishable_CXj-Borhy-db_Rh30N6wig_rAabBtgm' 

// Configuriamo il client forzando il fetch a ignorare i problemi di cache di rete di Next.js
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
  }
})

export const revalidate = 0 

export default async function Home() {
// Tutto il resto del codice da qui in poi rimane identico...
