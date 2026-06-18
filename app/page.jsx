// app/page.jsx
import { supabase } from '@/lib/supabase';

// Disabilitiamo la cache per avere sempre i dati aggiornati
export const revalidate = 0;

export async function generateMetadata() {
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, description')
    .eq('id', 1)
    .single();

  return {
    title: restaurant ? `${restaurant.name} - La Tradizione` : 'Menu',
  };
}

export default async function Home() {
  // 1. Recupero Dati
  const { data: restaurant, error: restError } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', 1)
    .single();

  const { data: menuItems, error: menuError } = await supabase
    .from('menu')
    .select('*')
    .eq('restaurant_id', 1);

  // 2. Handling errore o caricamento
  if (restError || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <p className="font-serif italic text-stone-500">Preparando il forno...</p>
      </div>
    );
  }

  // 3. Logica categorie
  const sortedCategories = ['Pizze Classiche', 'Pizze Speciali', 'Bibite', 'Birre Artigianali'];
  const existingCategories = menuItems ? Array.from(new Set(menuItems.map(item => item.category))) : [];
  const categories = sortedCategories.filter(cat => existingCategories.includes(cat))
    .concat(existingCategories.filter(cat => !sortedCategories.includes(cat)));

  const categoryImages = {
    'Pizze Classiche': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    'Pizze Speciali': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    'Bibite': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    'Birre Artigianali': 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80'
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-32">
      {/* Header */}
      <header className="relative bg-[#1C2D21] text-[#FAF8F5] pt-28 pb-24 px-4 text-center overflow-hidden border-b-4 border-[#B91C1C]">
        <div className="max-w-2xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 font-serif text-white">{restaurant.name}</h1>
          <p className="text-stone-200 text-sm md:text-base italic max-w-md mx-auto">{restaurant.description}</p>
        </div>
      </header>

      {/* Navigazione */}
      <div className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80 py-3 px-4 flex justify-center gap-2 overflow-x-auto">
        {categories.map((category) => (
          <a key={category} href={`#${category.replace(/\s+/g, '-').toLowerCase()}`} className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-white border border-stone-200">
            {category}
          </a>
        ))}
      </div>

      {/* Menu */}
      <main className="max-w-3xl mx-auto px-4 pt-12">
        {categories.map((category) => (
          <div key={category} id={category.replace(/\s+/g, '-').toLowerCase()} className="mb-16">
            <h3 className="text-2xl font-black mb-6">{category}</h3>
            <div className="grid gap-4">
              {menuItems
                ?.filter(item => item.category === category)
                .map((item) => (
                  <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-stone-500 text-sm">{item.description}</p>
                    </div>
                    <span className="text-[#B91C1C] font-black">{parseFloat(item.price).toFixed(2)} €</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
