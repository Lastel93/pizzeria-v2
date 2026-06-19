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
      if (data) setMenuData(data);
      setLoading(false);
    }
    fetchMenu();
  }, [params.id]);

  // LOGICA GERARCHICA AGGIORNATA
  const classifyItem = (item) => {
    const text = `${item.name} ${item.category || ""}`.toLowerCase();
    // Pizze
    if (/pizza/i.test(text)) return { main: "Pizze", sub: /bianc/i.test(text) ? "Pizze Bianche" : "Pizze Rosse" };
    // Piatti
    if (/primo/i.test(text)) return { main: "Piatti", sub: "Primi" };
    if (/secondo/i.test(text)) return { main: "Piatti", sub: "Secondi" };
    if (/hamburg/i.test(text)) return { main: "Piatti", sub: "Hamburger" };
    if (/kebab/i.test(text)) return { main: "Piatti", sub: "Kebab" };
    if (/fritt|patatin/i.test(text)) return { main: "Piatti", sub: "Fritti" };
    if (/falafel/i.test(text)) return { main: "Piatti", sub: "Falafel" };
    if (/contorno/i.test(text)) return { main: "Piatti", sub: "Contorni" };
    // Dolci
    if (/dolce|gelat|ghiaccio/i.test(text)) return { main: "Dolci", sub: "Dolci & Gelati" };
    // Bevande
    if (/acq|bibit|birr|vin|amar|caff/i.test(text)) return { main: "Bevande", sub: "Bevande" };
    // Extra
    return { main: "Extra", sub: "Altro" };
  };

  if (loading) return <div>Caricamento...</div>;

  const hierarchy = (menuData.menu_items || []).reduce((acc, item) => {
    const { main, sub } = classifyItem(item);
    if (!acc[main]) acc[main] = {};
    if (!acc[main][sub]) acc[main][sub] = [];
    acc[main][sub].push(item);
    return acc;
  }, {});

  const order = ["Pizze", "Piatti", "Dolci", "Extra", "Bevande"];

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-serif" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #FF0000 0, #FF0000 10px, #FFFFFF 10px, #FFFFFF 20px)' }}>
      <div className="bg-white p-8 md:p-12 max-w-4xl mx-auto shadow-2xl border-2 border-red-600">
        
        {/* Header con layout Screenshot 2026-06-19 alle 15.18.18.jpg */}
        <div className="flex justify-between items-start mb-8">
          <button className="bg-red-600 text-white font-black px-6 py-4 transform -rotate-3 hover:scale-105 transition shadow-lg">ORDINA QUI</button>
          <div className="text-center">
            <h1 className="text-6xl font-black text-red-700 uppercase tracking-tighter">{menuData.name}</h1>
            <p className="text-red-500 font-bold uppercase">{menuData.address}</p>
          </div>
          <div className="bg-red-600 text-white p-4 rounded-2xl text-xs font-bold w-32">
            <div className="text-center font-black mb-1">ORARI</div>
            LUN-DOM 10.00-23.00
          </div>
        </div>

        {/* Menu Items */}
        {order.filter(m => hierarchy[m]).map(mainCat => (
          <div key={mainCat} className="mt-8">
            <h2 className="text-3xl font-black text-red-700 uppercase border-b-2 border-red-700 mb-6">{mainCat}</h2>
            {Object.entries(hierarchy[mainCat]).map(([subCat, items]) => (
              <div key={subCat} className="mb-6">
                <h3 className="font-bold text-red-600 uppercase italic mb-3 underline">{subCat}</h3>
                <div className="grid md:grid-cols-2 gap-x-8">
                  {items.map((item, i) => (
                    <div key={i} className="flex justify-between border-b border-red-100 py-2">
                      <div><span className="font-bold text-red-900">{item.name}</span></div>
                      <span className="font-bold text-red-700">€{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
