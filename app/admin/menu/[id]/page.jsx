'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MenuPubblico({ params }) {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      const { data } = await supabase.from('restaurants').select('*, menu_items(*)').eq('id', params.id).single();
      if (data) setMenuData(data);
      setLoading(false);
    }
    fetchMenu();
  }, [params.id]);

  if (loading) return <div>Caricamento...</div>;

  const phone = menuData.phone || '3395663620';
  const whatsappUrl = `https://wa.me/39${phone}?text=Ciao%2C%20vorrei%20ordinare%20delle%20pizze`;

  return (
    <div className="min-h-screen bg-white p-2 md:p-4 font-serif">
      <div className="max-w-2xl mx-auto p-4 bg-white border-4 border-red-600">
        <div className="flex flex-col items-center border-b-2 border-red-600 pb-6 mb-6">
           <h1 className="text-4xl font-black text-red-700 uppercase text-center">{menuData.name}</h1>
           <p className="text-red-500 font-bold mb-4">{menuData.address}</p>
           <a href={whatsappUrl} target="_blank" className="bg-red-600 text-white font-black px-8 py-3 rounded-full shadow-lg">ORDINA SU WHATSAPP</a>
        </div>
        
        {/* Lista piatti ottimizzata per mobile */}
        {Object.entries(menuData.menu_items.reduce((acc, item) => {
           const cat = item.category || "Extra";
           if (!acc[cat]) acc[cat] = [];
           acc[cat].push(item);
           return acc;
        }, {})).map(([cat, items]) => (
          <div key={cat} className="mb-6">
            <h2 className="text-xl font-black text-red-700 uppercase border-b border-red-200 mb-2">{cat}</h2>
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-stone-100 text-sm">
                <div>
                  <span className="font-bold block">{item.name}</span>
                  <span className="text-[10px] text-stone-500">{item.description}</span>
                </div>
                <div className="font-bold text-red-700">
                  {parseFloat(item.price1) > 0 && <span>€{item.price1}</span>}
                  {parseFloat(item.price2) > 0 && <span> / €{item.price2}</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
