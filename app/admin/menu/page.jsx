'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [savingMenu, setSavingMenu] = useState(false);

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
    if (data) setMenuItems(data);
  };

  const addEmptyRow = () => {
    const newRow = { 
      id: Date.now(), 
      name: '', 
      description: '', 
      price: '0', 
      category: 'Varie', 
      restaurant_id: restaurant.id, 
      isNew: true 
    };
    setMenuItems([newRow, ...menuItems]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === menuItems.length ? [] : menuItems.map(i => i.id));
  };

  const toggleItem = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleItemChange = (id, campo, valore) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [campo]: valore } : item));
  };

  const handleSaveUpdatedMenu = async () => {
    setSavingMenu(true);
    for (const item of menuItems) {
      if (item.isNew) {
        await supabase.from('menu_items').insert([{ 
            restaurant_id: restaurant.id,
            name: item.name, 
            description: item.description, 
            price: item.price, // Salvato come stringa
            category: item.category 
        }]);
      } else {
        await supabase.from('menu_items').update({ 
            name: item.name, 
            description: item.description, 
            price: item.price, // Salvato come stringa
            category: item.category 
        }).eq('id', item.id);
      }
    }
    setSavingMenu(false);
    alert("Menu salvato con successo!");
    fetchMenuItems(restaurant.id);
  };

  const deleteSelected = async () => {
    if(!confirm(`Eliminare ${selectedIds.length} piatti?`)) return;
    await supabase.from('menu_items').delete().in('id', selectedIds);
    setSelectedIds([]);
    fetchMenuItems(restaurant.id);
  };

  if (loading) return <div className="p-10 text-center">Caricamento in corso...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto w-full space-y-8">
      <Link href="/admin/dashboard" className="text-sm font-semibold underline text-stone-500 hover:text-stone-900">← Torna alla Dashboard</Link>
      
      <h1 className="text-4xl font-black text-stone-900">CARICA IL TUO MENU</h1>

      <div className="bg-white p-6 border border-stone-200 rounded-2xl shadow-sm">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={addEmptyRow} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
            + Aggiungi Riga
          </button>
          <button onClick={toggleSelectAll} className="px-4 py-2 bg-stone-200 font-bold rounded-lg hover:bg-stone-300 transition">
            Seleziona Tutto
          </button>
          {selectedIds.length > 0 && (
            <button onClick={deleteSelected} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
              Elimina ({selectedIds.length})
            </button>
          )}
          <button onClick={handleSaveUpdatedMenu} disabled={savingMenu} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition ml-auto">
            {savingMenu ? "Salvataggio..." : "SALVA MODIFICHE"}
          </button>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 rounded-lg items-center border ${selectedIds.includes(item.id) ? 'bg-red-50 border-red-200' : 'bg-stone-50 border-stone-100'}`}>
              <input 
                type="checkbox" 
                checked={selectedIds.includes(item.id)} 
                onChange={() => toggleItem(item.id)} 
                className="col-span-1" 
              />
              <input 
                value={item.category || ''} 
                onChange={(e) => handleItemChange(item.id, 'category', e.target.value)} 
                className="col-span-2 p-1 text-xs font-bold uppercase rounded border border-stone-200" 
                placeholder="CAT" 
              />
              <input 
                value={item.name || ''} 
                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} 
                className="col-span-4 p-1 text-sm font-bold rounded border border-stone-200" 
                placeholder="Nome Piatto" 
              />
              <input 
                value={item.description || ''} 
                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} 
                className="col-span-4 p-1 text-sm rounded border border-stone-200" 
                placeholder="Descrizione" 
              />
              <input 
                value={item.price || ''} 
                onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} 
                className="col-span-1 p-1 text-sm font-bold rounded border border-stone-200" 
                placeholder="€" 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
