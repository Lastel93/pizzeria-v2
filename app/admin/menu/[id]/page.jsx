'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MenuPubblico({ params }) {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      // Recuperiamo nome, indirizzo e tutti gli items (il DB restituirà la colonna 'category')
      const { data, error } = await supabase
        .from('restaurants')
        .select('name, address, menu_items(*)')
        .eq('id', params.id)
        .single();
      
      if (data) setMenuData(data);
      setLoading(false);
    }
    fetchMenu();
  }, [params.id]);

  // Logica per raggruppare usando 'category'
  const groupByCategory = (items) => {
    // Definisci qui l'ordine che preferisci per le tue categorie
    const order = ["Pizze", "Piatti", "Birre e Bevande", "Gelati", "Extra"];
    
    const grouped = items.reduce((acc, item) => {
      // Usiamo 'category' invece di 'categoria'
      const cat = item.category || "Extra";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    
    // Ordiniamo le categorie basandoci sull'array 'order'
    return Object.keys(grouped).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  };

  if (loading) return <div className="text-center p-10 font-serif">Caricamento menu...</div>;
  if (!menuData) return <div className="text-center p-10 font-serif">Menu non trovato.</div>;

  const categories = groupByCategory(menuData.menu_items || []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-4 md:p-8 font-serif">
      <div className="border-[12px] md:border-[20px] border-[#D32F2F] p-6 md:p-12 max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-[#D32F2F] uppercase tracking-tighter">{menuData.name}</h1>
          <p className="text-[#D32F2F] font-bold text-md mt-2">{menuData.address}</p>
        </header>

        {/* Mappa le categorie trovate */}
        {categories.map((cat) => (
          <div key={cat} className="mb-10">
            <h2 className="text-2xl font-black text-[#D32F2F] uppercase border-b-2 border-[#D32F2F] mb-6">{cat}</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {menuData.menu_items
                .filter(i => (i.category || "Extra") === cat)
                .map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#D32F2F] text-lg">{item.name}</h3>
                      <p className="text-xs text-stone-600 italic">{item.description}</p>
                    </div>
                    <span className="font-bold text-[#D32F2F]">€{item.price}</span>
                  </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
