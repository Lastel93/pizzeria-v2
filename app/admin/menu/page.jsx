'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [localPreviews, setLocalPreviews] = useState([]);

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
    const newRow = { id: Date.now(), name: '', description: '', price: '0', category: 'Varie', restaurant_id: restaurant.id, isNew: true };
    setMenuItems([newRow, ...menuItems]);
  };

  const toggleSelectAll = () => setSelectedIds(selectedIds.length === menuItems.length ? [] : menuItems.map(i => i.id));
  
  const handleItemChange = (id, campo, valore) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [campo]: valore } : item));
  };

  const handleSaveUpdatedMenu = async () => {
    for (const item of menuItems) {
      if (item.isNew) await supabase.from('menu_items').insert([{ ...item, isNew: undefined }]);
      else await supabase.from('menu_items').update({ name: item.name, description: item.description, price: item.price, category: item.category }).eq('id', item.id);
    }
    alert("Menu salvato!");
    fetchMenuItems(restaurant.id);
  };

  const deleteSelected = async () => {
    if(!confirm(`Eliminare ${selectedIds.length} piatti?`)) return;
    await supabase.from('menu_items').delete().in('id', selectedIds);
    setSelectedIds([]);
    fetchMenuItems(restaurant.id);
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto w-full space-y-8">
      <Link href="/admin/dashboard" className="text-sm font-semibold underline">← Torna alla Dashboard</Link>
      <h1 className="text-4xl font-black text-stone-900">CARICA IL TUO MENU</h1>
      
      <div className="bg-white p-6 border rounded-2xl shadow-sm">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={addEmptyRow} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg">+ Aggiungi Riga</button>
          {selectedIds.length > 0 && <button onClick={deleteSelected} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg">Elimina ({selectedIds.length})</button>}
          <button onClick={handleSaveUpdatedMenu} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg">SALVA MODIFICHE</button>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 p-2 bg-stone-50 rounded-lg items-center">
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i=>i!==item.id) : [...prev, item.id])} />
              <input value={item.category} onChange={(e) => handleItemChange(item.id, 'category', e.target.value)} className="col-span-2 p-1 text-xs font-bold uppercase rounded border" placeholder="CAT" />
              <input value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="col-span-4 p-1 text-sm font-bold rounded border" placeholder="Nome Piatto" />
              <input value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="col-span-4 p-1 text-sm rounded border" placeholder="Descrizione" />
              <input value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="col-span-1 p-1 text-sm font-bold rounded border" placeholder="€" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
