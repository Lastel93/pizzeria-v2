// Test di aggiornamento

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Assicurati che il percorso sia corretto

export default function MenuPubblico({ params }) {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      // Recupera i dati del ristorante e del menu tramite l'ID passato nell'URL
      const { data, error } = await supabase
        .from('restaurants')
        .select('name, address, menu_items(*)') // Assicurati di avere una tabella menu_items collegata
        .eq('id', params.id)
        .single();
      
      if (data) setMenuData(data);
      setLoading(false);
    }
    fetchMenu();
  }, [params.id]);

  if (loading) return <div className="text-center p-10">Caricamento menu...</div>;
  if (!menuData) return <div className="text-center p-10">Menu non trovato.</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-serif">
      {/* CORNICE A SCACCHI (Stile Mambo) */}
      <div className="border-[12px] md:border-[20px] border-[#D32F2F] p-6 md:p-12 max-w-4xl mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-[#D32F2F] uppercase tracking-tighter">{menuData.name}</h1>
          <p className="text-[#D32F2F] font-bold text-md mt-2">{menuData.address}</p>
        </header>

        {/* GRIGLIA DINAMICA */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {menuData.menu_items?.map((item, index) => (
            <div key={index} className="flex justify-between items-start border-b border-[#D32F2F]/20 pb-2">
              <div>
                <h3 className="font-bold text-[#D32F2F] text-lg">{item.name}</h3>
                <p className="text-xs text-stone-600 italic">{item.description}</p>
              </div>
              <span className="font-bold text-[#D32F2F]">€{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
