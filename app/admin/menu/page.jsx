'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [localPreviews, setLocalPreviews] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

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
        // Pulizia prezzo: toglie € e caratteri strani, virgola diventa punto
        let cleanPrice = "0";
        if (p.price) {
          cleanPrice = String(p.price).replace(',', '.').replace(/[^0-9.]/g, '');
        }

        return { 
          name: p.name || "Senza nome",
          description: p.description || "",
          price: cleanPrice || "0",
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

  const handleItemChange = (id, campo, valore) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [campo]: valore } : item));
  };

  const handleSaveUpdatedMenu = async () => {
    for (const item of menuItems) {
      if (item.isNew) await supabase.from('menu_items').insert([{ ...item, restaurant_id: restaurant.id, isNew: undefined }]);
      else await supabase.from('menu_items').update({ name: item.name, description: item.description, price: item.price, category: item.category }).eq('id', item.id);
    }
    alert("Menu salvato!");
    fetchMenuItems(restaurant.id);
  };

  if (loading) return <div className="p-10 text-center">Caricamento...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-4xl font-black">CARICA IL TUO MENU</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center justify-center p-6 bg-[#1C2D21] text-white rounded-2xl cursor-pointer font-bold">📸 FOTOCAMERA <input type="file" accept="image/*" capture="environment" onChange={handleFileSelection} className="hidden" /></label>
        <label className="flex items-center justify-center p-6 bg-white border-2 border-[#1C2D21] rounded-2xl cursor-pointer font-bold">📁 GALLERIA <input type="file" accept="image/*" multiple onChange={handleFileSelection} className="hidden" /></label>
      </div>
      {localPreviews.length > 0 && <button onClick={handleSaveAllMenu} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl">CONVERTI CON IA</button>}
      {analyzing && <div className="p-4 bg-amber-100 rounded-lg">Analisi in corso...</div>}
      
      <div className="bg-white border rounded-2xl p-6">
        <button onClick={handleSaveUpdatedMenu} className="mb-4 px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold">SALVA TUTTO</button>
        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 p-2 bg-stone-50 rounded items-center">
              <input value={item.category} onChange={(e) => handleItemChange(item.id, 'category', e.target.value)} className="col-span-2 p-1 border rounded" />
              <input value={item.name} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="col-span-4 p-1 border rounded" />
              <input value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="col-span-4 p-1 border rounded" />
              <input value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="col-span-2 p-1 border rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
