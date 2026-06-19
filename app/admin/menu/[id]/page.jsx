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
        const sortedItems = (data.menu_items || []).sort((a, b) => a.id - b.id);
        setMenuData({ ...data, menu_items: sortedItems });
      }
      setLoading(false);
    }
    fetchMenu();
  }, [params.id]);

  if (loading) return <div>Caricamento...</div>;

  const grouped = (menuData.menu_items || []).reduce((acc, item) => {
    const cat = item.category || "Extra";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const orderedKeys = Object.keys(grouped).sort((a, b) => {
    if (a === "Pizze Rosse") return -1;
    if (b === "Pizze Rosse") return 1;
    if (a === "Pizze Bianche") return -1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-white p-4 font-serif" style={{ border: '20px solid red', borderImage: 'repeating-linear-gradient(45deg, red, red 10px, white 10px, white 20px) 20' }}>
      <div className="max-w-4xl mx-auto p-6 bg-white">
        
        {/* Header con link WhatsApp e Orari estesi */}
        <div className="flex justify-between items-start border-b-2 border-red-600 pb-6 mb-8">
           <a 
              href="https://wa.me/393395663620?text=Ciao%2C%20vorrei%20ordinare%20delle%20pizze" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-red-600 text-white font-black px-6 py-3 -rotate-2 hover:bg-red-700 transition"
           >
             ORDINA QUI
           </a>
           
           <div className="text-center">
             <h1 className="text-5xl font-black text-red-700 uppercase tracking-tighter">{menuData.name}</h1>
             <p className="text-red-500 font-bold">{menuData.address}</p>
           </div>
           
           <div className="text-[9px] font-bold text-red-600 text-right leading-tight">
              <div>LUN 10.00-23.00</div>
              <div>MAR 10.00-23.00</div>
              <div>MER 10.00-23.00</div>
              <div>GIO 10.00-23.00</div>
              <div>VEN 10.00-23.00</div>
              <div>SAB 10.00-23.00</div>
              <div>DOM 10.00-23.00</div>
           </div>
        </div>

        {/* Lista Piatti */}
        {orderedKeys.map(cat => (
          <div key={cat} className="mb-8">
            <h2 className="text-2xl font-black text-red-700 uppercase mb-4">{cat}</h2>
            <div className="grid md:grid-cols-2 gap-x-12">
              {grouped[cat].map((item, i) => (
                <div key={i} className="flex justify-between items-start border-b border-red-100 py-2">
                  <div className="flex-1">
                    <span className="font-bold text-red-900 block">{item.name}</span>
                    <p className="text-[10px] text-red-400 italic leading-tight">{item.description}</p>
                  </div>
                  {/* Rendering dinamico dei prezzi */}
                  <div className="flex items-center gap-2 font-bold text-red-700 pl-4 whitespace-nowrap">
                    {parseFloat(item.price1) > 0 && <span>€{item.price1}</span>}
                    {parseFloat(item.price2) > 0 && <><span>/</span><span>€{item.price2}</span></>}
                    {parseFloat(item.price3) > 0 && <><span>/</span><span>€{item.price3}</span></>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
