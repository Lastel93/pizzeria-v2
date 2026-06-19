'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MenuPubblico({ params }) {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      const { data } = await supabase
        .from('restaurants')
        .select('name, address, menu_items(*)')
        .eq('id', params.id)
        .single();
      
      if (data) {
        // Ordiniamo per l'ID o created_at per mantenere l'ordine di inserimento (scansione)
        const sortedItems = (data.menu_items || []).sort((a, b) => a.id - b.id);
        setMenuData({ ...data, menu_items: sortedItems });
      }
      setLoading(false);
    }
    fetchMenu();
  }, [params.id]);

  if (loading) return <div>Caricamento...</div>;

  // Raggruppiamo mantenendo l'ordine di comparsa
  const grouped = (menuData.menu_items || []).reduce((acc, item) => {
    const cat = item.category || "Extra";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Ordine forzato Pizze Rosse > Bianche > Altro
  const orderedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Pizze Rosse") return -1;
    if (b === "Pizze Rosse") return 1;
    if (a === "Pizze Bianche") return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-white p-4 font-serif" style={{ border: '20px solid red', borderImage: 'repeating-linear-gradient(45deg, red, red 10px, white 10px, white 20px) 20' }}>
      <div className="max-w-4xl mx-auto p-6 bg-white">
        
        {/* Header Design ispirato a Screenshot 2026-06-19 alle 15.18.18.jpg */}
        <div className="flex justify-between items-start border-b-2 border-red-600 pb-6 mb-8">
           <button className="bg-red-600 text-white font-black px-6 py-3 -rotate-2">ORDINA QUI</button>
           <div className="text-center">
             <h1 className="text-5xl font-black text-red-700 uppercase tracking-tighter">{menuData.name}</h1>
             <p className="text-red-500 font-bold">{menuData.address}</p>
           </div>
           <div className="bg-red-600 text-white p-3 text-xs font-bold text-center">ORARI<br/>LUN-DOM 10.00-23.00</div>
        </div>

        {/* Visualizzazione lineare rispettando l'ordine di scansione */}
        {orderedKeys.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-2xl font-black text-red-700 uppercase mb-4">{cat}</h2>
            <div className="grid md:grid-cols-2 gap-x-12">
              {grouped[cat].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-red-100 py-1">
                  <div>
                    <span className="font-bold text-red-900">{item.name}</span>
                    <p className="text-[10px] text-red-400 italic">{item.description}</p>
                  </div>
                  <span className="font-bold text-red-700">€{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
