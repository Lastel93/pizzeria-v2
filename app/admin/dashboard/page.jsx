'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingData, setUpdatingData] = useState(false);
  
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

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
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setRestaurant(data);
        setName(data.name || '');
        setAddress(data.address || '');
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleUpdateData = async () => {
    if (!name.trim()) { alert("Il nome del ristorante non può essere vuoto."); return; }
    try {
      setUpdatingData(true);
      const { error } = await supabase.from('restaurants').update({ name, address }).eq('id', restaurant.id);
      if (error) throw error;
      setRestaurant(prev => ({ ...prev, name, address }));
      alert("Dati aggiornati con successo!");
    } catch (error) { alert("Errore durante l'aggiornamento: " + error.message); }
    finally { setUpdatingData(false); }
  };

  const handleResetPassword = async () => {
    const email = (await supabase.auth.getUser()).data.user.email;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) alert(error.message);
    else alert("Controlla la tua email per reimpostare la password!");
  };

  const handleOrarioChange = (giorno, campo, valore) => {
    setOrari(prev => ({ ...prev, [giorno]: { ...prev[giorno], [campo]: valore } }));
  };

  if (loading) return <div className="flex h-full items-center justify-center text-stone-500 animate-pulse">Caricamento...</div>;
  if (!restaurant) return <div className="p-10 text-center text-stone-500 mt-20">Nessun ristorante configurato.</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 tracking-tight">{restaurant.name}</h1>
          <p className="text-stone-500 mt-1">📍 {restaurant.address || "Indirizzo non configurato"}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Link href={`/menu/${restaurant.id}`} target="_blank" className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition text-center">
            👁️ Vedi Menu Online
          </Link>
          <Link href="/admin/menu" className="px-8 py-3 bg-[#1C2D21] text-white font-bold rounded-xl hover:bg-[#2d4a36] transition text-center">
            🍔 GESTISCI IL TUO MENU
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Dati Locale</h3>
            <div className="space-y-4">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" />
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl" />
              <button onClick={handleUpdateData} disabled={updatingData} className="w-full py-2.5 bg-[#1C2D21] text-white font-semibold rounded-xl">
                {updatingData ? "Aggiornamento..." : "Aggiorna Dati"}
              </button>
              <button onClick={handleResetPassword} className="w-full py-2 text-stone-400 hover:text-stone-600 text-xs underline">
                Reimposta password
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-6">Orari di Apertura</h3>
            <div className="space-y-3">
              {Object.keys(orari).map((giorno) => (
                <div key={giorno} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-stone-100 rounded-xl bg-stone-50 gap-3">
                  <div className="flex items-center gap-4 min-w-[140px]">
                    <span className="font-semibold text-stone-700 text-sm w-20">{giorno}</span>
                    <button onClick={() => handleOrarioChange(giorno, 'aperto', !orari[giorno].aperto)} className={`px-3 py-1 rounded-full text-xs font-bold ${orari[giorno].aperto ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {orari[giorno].aperto ? 'Aperto' : 'Chiuso'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="time" value={orari[giorno].inizio} onChange={(e) => handleOrarioChange(giorno, 'inizio', e.target.value)} className="p-1.5 bg-white border border-stone-200 rounded-lg text-sm" />
                    <span className="text-stone-400 text-sm">al</span>
                    <input type="time" value={orari[giorno].fine} onChange={(e) => handleOrarioChange(giorno, 'fine', e.target.value)} className="p-1.5 bg-white border border-stone-200 rounded-lg text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
