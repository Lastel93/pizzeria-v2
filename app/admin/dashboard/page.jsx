'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Stato per gestire gli orari in modo semplice
  const [orari, setOrari] = useState({
    Lunedì: { aperto: true, inizio: "12:00", fine: "23:00" },
    Martedì: { aperto: true, inizio: "12:00", fine: "23:00" },
    Mercoledì: { aperto: true, inizio: "12:00", fine: "23:00" },
    Giovedì: { aperto: true, inizio: "12:00", fine: "23:00" },
    Venerdì: { aperto: true, inizio: "12:00", fine: "24:00" },
    Sabato: { aperto: true, inizio: "12:00", fine: "24:00" },
    Domenica: { aperto: true, inizio: "12:00", fine: "23:00" },
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setRestaurant(data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Gestore del cambio orario visivo
  const handleOrarioChange = (giorno, campo, valore) => {
    setOrari(prev => ({
      ...prev,
      [giorno]: {
        ...prev[giorno],
        [campo]: valore
      }
    }));
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-stone-500 animate-pulse">Caricamento...</div>;
  }

  if (!restaurant) {
    return <div className="p-10 text-center text-stone-500 mt-20">Nessun ristorante configurato.</div>;
  }

  return (
    <div className="p-10 max-w-5xl mx-auto w-full">
      
      {/* HEADER PRINCIPALE */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">{restaurant.name}</h1>
          <p className="text-stone-500 mt-1">📍 {restaurant.address || "Indirizzo non configurato (Piazza della Pizzeria, 1)"}</p>
        </div>
        
        {/* IL PULSANTONE MENU CHE VOLEVI */}
        <Link href="/admin/menu" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-[#1C2D21] rounded-xl hover:bg-[#2d4a36] shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 text-center">
          🍔 GESTISCI IL TUO MENU
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SCHEDA INFORMAZIONI GENERALI */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Dati Locale</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Nome Ristorante</label>
                <input 
                  type="text" 
                  defaultValue={restaurant.name} 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none focus:border-[#1C2D21]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-stone-400 mb-1">Indirizzo Completo</label>
                <input 
                  type="text" 
                  defaultValue={restaurant.address || "Via Roma, 12, Milano"} 
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none focus:border-[#1C2D21]"
                />
              </div>
              <button className="w-full py-2.5 bg-stone-100 text-[#1C2D21] font-semibold rounded-xl hover:bg-stone-200 transition text-sm">
                Aggiorna Dati
              </button>
            </div>
          </div>
        </div>

        {/* SPECCHIETTO ORARI USER-FRIENDLY */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-stone-800">Orari di Apertura</h3>
              <span className="text-xs text-stone-400 font-medium">Configura i turni settimanali</span>
            </div>

            <div className="space-y-3">
              {Object.keys(orari).map((giorno) => (
                <div key={giorno} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-stone-100 rounded-xl bg-stone-50 gap-3">
                  
                  {/* Nome Giorno e Toggle Stato */}
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <span className="font-semibold text-stone-700 text-sm w-20">{giorno}</span>
                    <button 
                      onClick={() => handleOrarioChange(giorno, 'aperto', !orari[giorno].aperto)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${orari[giorno].aperto ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {orari[giorno].aperto ? 'Aperto' : 'Chiuso'}
                    </button>
                  </div>

                  {/* Selettori Orario (Disabilitati se Chiuso) */}
                  <div className="flex items-center gap-2">
                    <input 
                      type="time" 
                      value={orari[giorno].inizio}
                      disabled={!orari[giorno].aperto}
                      onChange={(e) => handleOrarioChange(giorno, 'inizio', e.target.value)}
                      className="p-1.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 disabled:opacity-50"
                    />
                    <span className="text-stone-400 text-sm">al</span>
                    <input 
                      type="time" 
                      value={orari[giorno].fine}
                      disabled={!orari[giorno].aperto}
                      onChange={(e) => handleOrarioChange(giorno, 'fine', e.target.value)}
                      className="p-1.5 bg-white border border-stone-200 rounded-lg text-sm text-stone-700 disabled:opacity-50"
                    />
                  </div>

                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-[#1C2D21]/10 text-[#1C2D21] font-bold rounded-xl hover:bg-[#1C2D21]/15 transition text-sm">
              Salva Orari Settimanali
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
