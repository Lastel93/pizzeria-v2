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
  const [savingMenu, setSavingMenu] = useState(false);
  const [localPreviews, setLocalPreviews] = useState([]);
  
  // NUOVO STATO PER CANCELLAZIONE MASSIVA
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
    const { data } = await supabase.from('menu_items').select('*').eq('restaurant_id', restId).order('category', { ascending: true });
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

  const removeLocalPreview = (idToRemove, urlToRelease) => {
    setLocalPreviews(prev => prev.filter(item => item.id !== idToRemove));
    URL.revokeObjectURL(urlToRelease); 
  };

  const handleSaveAllMenu = async () => {
    if (!localPreviews.length || !restaurant) return;
    try {
      setUploading(true);
      let lastUploadedUrl = '';
      const uploadPromises = localPreviews.map(async (item) => {
        const fileExt = item.file.name.split('.').pop() || 'jpg';
        const fileName = `${restaurant.id}/${Date.now()}_${item.id}.${fileExt}`;
        const { error: storageError } = await supabase.storage.from('menu-docs').upload(fileName, item.file);
        if (storageError) throw storageError;
        const { data: { publicUrl } } = supabase.storage.from('menu-docs').getPublicUrl(fileName);
        lastUploadedUrl = publicUrl;
        return { restaurant_id: restaurant.id, file_url: publicUrl, type: 'menu' };
      });
      const documentsToInsert = await Promise.all(uploadPromises);
      await supabase.from('menu_documents').insert(documentsToInsert);
      localPreviews.forEach(item => URL.revokeObjectURL(item.previewUrl));
      setLocalPreviews([]);
      setUploading(false);
      runAIAnalysis(lastUploadedUrl);
    } catch (error) {
      alert("Errore caricamento: " + error.message);
      setUploading(false);
    }
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
      const piattiPronti = piattiEstratti.map(p => ({
        name: p.name,
        description: p.description || '',
        price: parseFloat(p.price) || 0,
        category: p.category || 'Varie',
        restaurant_id: restaurant.id
      }));
      await supabase.from('menu_items').insert(piattiPronti);
      await fetchMenuItems(restaurant.id);
    } catch (err) {
      alert("Errore lettura IA: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // LOGICA CANCELLAZIONE MASSIVA
  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === menuItems.length ? [] : menuItems.map(i => i.id));
  };

  const toggleItem = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const deleteSelected = async () => {
    if(!confirm(`Eliminare ${selectedIds.length} piatti?`)) return;
    await supabase.from('menu_items').delete().in('id', selectedIds);
    setSelectedIds([]);
    fetchMenuItems(restaurant.id);
  };

  const handleItemChange = (id, campo, valore) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [campo]: valore } : item));
  };

  const handleSaveUpdatedMenu = async () => {
    setSavingMenu(true);
    for (const item of menuItems) {
      await supabase.from('menu_items').update({ name: item.name, description: item.description, price: parseFloat(item.price), category: item.category }).eq('id', item.id);
    }
    setSavingMenu(false);
    alert("Menu aggiornato!");
  };

  if (loading) return <div className="p-10 text-center">Caricamento...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto w-full space-y-10">
      <Link href="/admin/dashboard" className="text-sm font-semibold text-[#1C2D21] hover:underline">← Torna alla Dashboard</Link>
      
      {/* ... (Lascia qui le tue sezioni di upload e preview come le avevi) ... */}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Piatti & Listino</h3>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button onClick={deleteSelected} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg">Elimina ({selectedIds.length})</button>
            )}
            <button onClick={toggleSelectAll} className="px-4 py-2 bg-stone-200 font-bold rounded-lg">
              {selectedIds.length === menuItems.length ? 'Deseleziona' : 'Seleziona Tutto'}
            </button>
            <button onClick={handleSaveUpdatedMenu} disabled={savingMenu} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl">{savingMenu ? "..." : "SALVA"}</button>
          </div>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.id} className={`grid grid-cols-12 gap-2 p-3 border rounded-xl items-center ${selectedIds.includes(item.id) ? 'bg-red-50' : 'bg-stone-50'}`}>
              <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleItem(item.id)} className="col-span-1" />
              <input value={item.category || ''} onChange={(e) => handleItemChange(item.id, 'category', e.target.value)} className="col-span-2 p-1 text-xs font-bold uppercase rounded" />
              <input value={item.name || ''} onChange={(e) => handleItemChange(item.id, 'name', e.target.value)} className="col-span-4 p-1 text-sm font-bold rounded" />
              <input value={item.description || ''} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="col-span-4 p-1 text-sm rounded" />
              <input type="number" value={item.price || ''} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="col-span-1 p-1 text-sm font-bold rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
