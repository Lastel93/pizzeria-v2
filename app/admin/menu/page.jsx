'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [localPreviews, setLocalPreviews] = useState([]);
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

  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newPreviews = files.map(file => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9) 
    }));
    setLocalPreviews(prev => [...prev, ...newPreviews]);
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
      if (!Array.isArray(piattiEstratti)) throw new Error("Risposta IA non valida");

      const piattiPronti = piattiEstratti.map(p => {
        const cleanP = (val) => String(val || "0").replace(',', '.').replace(/[^0-9.]/g, '');
        return { 
          name: p.name || "Senza nome",
          description: p.description || "",
          price1: cleanP(p.price1),
          price2: cleanP(p.price2),
          price3: cleanP(p.price3),
          category: p.category || "Generico",
          restaurant_id: restaurant.id
        };
      });

      await supabase.from('menu_items').insert(piattiPronti);
      fetchMenuItems(restaurant.id);
    } catch (err) {
      alert("Errore: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAllMenu = async () => {
    if (!localPreviews.length || !restaurant) return;
    try {
      setUploading(true);
      let lastUrl = '';
      for (const item of localPreviews) {
        const fileName = `${restaurant.id}/${Date.now()}_${item.id}.jpg`;
        await supabase.storage.from('menu-docs').upload(fileName, item.file);
        const { data } = supabase.storage.from('menu-docs').getPublicUrl(fileName);
        lastUrl = data.publicUrl;
      }
      setLocalPreviews([]);
      setUploading(false);
      runAIAnalysis(lastUrl);
    } catch (e) {
      alert("Errore: " + e.message);
      setUploading(false);
    }
  };

  const addEmptyRow = () => {
    setMenuItems([{ id: Date.now(), name: '', description: '', price1: '0', price2: '0', price3: '0', category: 'Varie', isNew: true }, ...menuItems]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === menuItems.length ? [] : menuItems.map(i => i.id));
  };

  const handleItemChange = (id, campo, valore) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [campo]: valore } : item));
  };

  const handleSaveUpdatedMenu = async () => {
    setSavingMenu(true);
    for (const item of menuItems) {
      const dataToSave = { name: item.name, description: item.description, price1: item.price1, price2: item.price2, price3: item.price3, category: item.category };
      if (item.isNew) await supabase.from('menu_items').insert([{ ...dataToSave, restaurant_id: restaurant.id }]);
      else await supabase.from('menu_items').update(dataToSave).eq('id', item.id);
    }
    setSavingMenu(false);
    alert("Menu salvato!");
    fetchMenuItems(restaurant.id);
  };

  const deleteSelected = async () => {
    if(!confirm(`Eliminare ${selectedIds.length} piatti?`)) return;
    await supabase.from('menu_items').delete().in('id', selectedIds);
    setSelectedIds([]);
    fetchMenuItems(restaurant.id);
  };

  if (loading) return <div className="p-10 text-center">Caricamento...</div>;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-8">
      <Link href="/admin/dashboard" className="text-sm font-semibold underline">← Torna alla Dashboard</Link>
      <h1 className="text-3xl md:text-4xl font-black">CARICA IL TUO MENU</h1>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center justify-center p-4 md:p-6 bg-[#1C2D21] text-white rounded-2xl cursor-pointer font-bold text-sm md:text-base">📸 FOTOCAMERA <input type="file" accept="image/*" capture="environment" onChange={handleFileSelection} className="hidden" /></label>
        <label className="flex items-center justify-center p-4 md:p-6 bg-white border-2 border-[#1C2D21] rounded-2xl cursor-pointer font-bold text-sm md:text-base">📁 GALLERIA <input type="file" accept="image/*" multiple onChange={handleFileSelection} className="hidden" /></label>
      </div>

      {localPreviews.length > 0 && <button onClick={handleSaveAllMenu} disabled={uploading} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl">{uploading ? "Caricamento..." : "💾 CONVERTI CON IA"}</button>}
      {analyzing && <div className="text-center p-4 bg-amber-100 rounded-lg animate-pulse">L'IA sta leggendo il menu...</div>}

      <div className="bg-white border rounded-2xl p-4 md:p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={addEmptyRow} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">+ Aggiungi</button>
          <button onClick={toggleSelectAll} className="px-4 py-2 bg-stone-200 rounded-lg font-bold text-sm">{selectedIds.length === menuItems.length ? "Deseleziona" : "Seleziona Tutto"}</button>
          <button onClick={deleteSelected} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm">Elimina ({selectedIds.length})</button>
          <button onClick={handleSaveUpdatedMenu} disabled={savingMenu} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm">{savingMenu ? "Salvataggio..." : "SALVA TUTTO"}</button>
        </div>
        
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-1 md:gap-2 p-1 md:p-2 bg-stone-50 rounded items-center text-xs md:text-sm">
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(i=>i!==item.id) : [...prev, item.id])} className="col-span-1" />
              <input value={item.category || ''} onChange={(e) => handleItemChange(item.id, 'category', e.target.value)} className="col-span-2 md:col-span-1 p-1 border rounded" placeholder="Cat." />
              <input value={item.name || ''} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="col-span-4 md:col-span-3 p-1 border rounded" placeholder="Nome" />
              <input value={item.description || ''} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="col-span-2 md:col-span-4 p-1 border rounded hidden md:block" placeholder="Descrizione" />
              <input value={item.price1 || ''} onChange={(e) => handleItemChange(item.id, 'price1', e.target.value)} className="col-span-1 p-1 border rounded text-center" placeholder="P1" />
              <input value={item.price2 || ''} onChange={(e) => handleItemChange(item.id, 'price2', e.target.value)} className="col-span-1 p-1 border rounded text-center" placeholder="P2" />
              <input value={item.price3 || ''} onChange={(e) => handleItemChange(item.id, 'price3', e.target.value)} className="col-span-1 p-1 border rounded text-center" placeholder="P3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
