'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('restaurants').select('*').eq('owner_id', user.id).single();
      if (data) {
        setRestaurant(data);
        fetchMenuItems(data.id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const fetchMenuItems = async (restId) => {
    const { data } = await supabase.from('menu_items').select('*').eq('restaurant_id', restId).order('id');
    setMenuItems(data || []); // Sicurezza: se è null, imposta array vuoto
  };

  const runAIAnalysis = async (imageUrl) => {
    try {
      setAnalyzing(true);
      const response = await fetch('/api/parse-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      
      const piattiEstratti = await response.json();
      console.log("Risposta API:", piattiEstratti); // Debug: apri la console del browser (F12)

      if (!Array.isArray(piattiEstratti)) {
        throw new Error("Formato risposta non valido");
      }

      const piattiPronti = piattiEstratti.map(p => ({ 
        name: p.name || "Senza nome",
        description: p.description || "",
        price: String(p.price || ""),
        category: p.category || "Generico",
        restaurant_id: restaurant.id
      }));

      await supabase.from('menu_items').insert(piattiPronti);
      fetchMenuItems(restaurant.id);
    } catch (err) {
      alert("Errore: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // UI protetta
  if (loading) return <div className="p-10 text-center">Caricamento...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-4xl font-black">GESTIONE MENU</h1>
      
      {/* Input file semplificato per testare il caricamento */}
      <div className="p-4 bg-stone-100 rounded">
         <input type="file" onChange={(e) => {
            // Qui inseriresti la logica di caricamento su storage, 
            // ma per ora testiamo se la funzione di analisi parte
            console.log("File selezionato");
         }} />
      </div>

      {analyzing && <div className="p-4 bg-amber-200">Analisi in corso... attendi.</div>}

      <div className="space-y-2">
        {menuItems && menuItems.length > 0 ? (
          menuItems.map((item) => (
            <div key={item.id} className="p-4 border rounded bg-white shadow-sm">
              <p className="font-bold">{item.name}</p>
              <p className="text-sm">{item.category} - {item.price}</p>
            </div>
          ))
        ) : (
          <p>Nessun piatto presente. Carica un menu.</p>
        )}
      </div>
    </div>
  );
}
