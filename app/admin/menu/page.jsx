'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dbDocuments, setDbDocuments] = useState([]); 
  const [localPreviews, setLocalPreviews] = useState([]);
  
  // STATO PER I PIATTI DEL MENU REALI ED EDITABILI
  const [menuItems, setMenuItems] = useState([]);
  const [savingMenu, setSavingMenu] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setRestaurant(data);
        fetchUploadedDocuments(data.id);
        fetchMenuItems(data.id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const fetchUploadedDocuments = async (restId) => {
    const { data } = await supabase
      .from('menu_documents')
      .select('*')
      .eq('restaurant_id', restId)
      .order('created_at', { ascending: false });
    if (data) setDbDocuments(data);
  };

  // Recupera i piatti digitali salvati
  const fetchMenuItems = async (restId) => {
    const { data } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restId)
      .order('category', { ascending: true });
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

  // Carica le immagini e lancia la conversione IA sicura
  const handleSaveAllMenu = async () => {
    if (!localPreviews.length || !restaurant) return;

    try {
      setUploading(true);
      let lastUploadedUrl = '';

      const uploadPromises = localPreviews.map(async (item) => {
        const fileExt = item.file.name.split('.').pop() || 'jpg';
        const fileName = `${restaurant.id}/${Date.now()}_${item.id}.${fileExt}`;

        const { error: storageError } = await supabase.storage
          .from('menu-docs')
          .upload(fileName, item.file);

        if (storageError) throw storageError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-docs')
          .getPublicUrl(fileName);

        lastUploadedUrl = publicUrl;
        return { restaurant_id: restaurant.id, file_url: publicUrl, type: 'menu' };
      });

      const documentsToInsert = await Promise.all(uploadPromises);
      await supabase.from('menu_documents').insert(documentsToInsert);

      localPreviews.forEach(item => URL.revokeObjectURL(item.previewUrl));
      setLocalPreviews([]);
      fetchUploadedDocuments(restaurant.id);

      // Finito l'upload su Supabase Storage, avviamo l'analisi IA sicura
      setUploading(false);
      runAIAnalysis(lastUploadedUrl);

    } catch (error) {
      alert("Errore durante il caricamento: " + error.message);
      setUploading(false);
    }
  };

  // CHIAMATA ALLA ROTTA BACKEND SICURA (OPENAI_API_KEY non viene esposta sul browser)
  const runAIAnalysis = async (imageUrl) => {
    try {
      setAnalyzing(true);
      
      const response = await fetch('/api/parse-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Il server non è riuscito ad elaborare la richiesta di lettura dell'immagine.");
      }

      const piattiEstratti = await response.json();

      if (!piattiEstratti || piattiEstratti.length === 0) {
        alert("L'IA non ha rilevato testi o piatti leggibili. Prova a caricare uno scatto più nitido.");
        return;
      }

      // Associazioni obbligatorie con il restaurant_id corrente prima dell'insert
      const piattiPronti = piattiEstratti.map(p => ({
        name: p.name,
        description: p.description || '',
        price: parseFloat(p.price) || 0,
        category: p.category || 'Varie',
        restaurant_id: restaurant.id
      }));

      // Inseriamo i dati reali nel database Supabase
      const { error } = await supabase.from('menu_items').insert(piattiPronti);
      if (error) throw error;

      // Sincronizziamo lo stato locale ripescando i record freschi dal DB
      await fetchMenuItems(restaurant.id);
      alert(`Ottimo! L'IA ha letto l'immagine e ha importato ${piattiPronti.length} piatti reali nel listino digitale.`);

    } catch (err) {
      alert("Errore lettura IA: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Funzioni per modificare i campi di testo in tempo reale nella griglia
  const handleItemChange = (id, campo, valore) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [campo]: valore } : item));
  };

  // Salva le modifiche manuali fatte dal ristoratore
  const handleSaveUpdatedMenu = async () => {
    try {
      setSavingMenu(true);
      for (const item of menuItems) {
        await supabase
          .from('menu_items')
          .update({ name: item.name, description: item.description, price: parseFloat(item.price), category: item.category })
          .eq('id', item.id);
      }
      alert("Menu aggiornato e sincronizzato online!");
    } catch (e) {
      alert("Errore salvataggio: " + e.message);
    } finally {
      setSavingMenu(false);
    }
  };

  const deleteItem = async (id) => {
    if(!confirm("Eliminare questo piatto?")) return;
    await supabase.from('menu_items').delete().eq('id', id);
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  if (loading) return <div className="p-10 text-center text-stone-500 animate-pulse">Caricamento menu...</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto w-full space-y-10">
      
      <div>
        <Link href="/admin/dashboard" className="text-sm font-semibold text-[#1C2D21] hover:underline">
          ← Torna alla Dashboard
        </Link>
      </div>

      <header>
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Gestione Menu</h1>
        <p className="text-stone-500 mt-1">Carica la foto. L'IA la leggerà e la trasformerà in piatti digitali modificabili.</p>
      </header>

      {/* TASTI CARICAMENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center justify-center gap-3 p-6 bg-[#1C2D21] text-white rounded-2xl cursor-pointer hover:bg-[#2d4a36] shadow-md transition font-bold text-lg">
          📸 USA FOTOCAMERA
          <input type="file" accept="image/*" capture="environment" onChange={handleFileSelection} className="hidden" />
        </label>

        <label className="flex items-center justify-center gap-3 p-6 bg-white text-[#1C2D21] border-2 border-[#1C2D21] rounded-2xl cursor-pointer hover:bg-stone-50 shadow-sm transition font-bold text-lg">
          📁 CARICA DA GALLERIA
          <input type="file" accept="image/*,application/pdf" multiple onChange={handleFileSelection} className="hidden" />
        </label>
      </div>

      {/* SEZIONE ANTEPRIME SCATTI */}
      {localPreviews.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-500 p-6 shadow-sm">
          <h3 className="text-xl font-bold text-stone-800 mb-4">Verifica i tuoi scatti</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {localPreviews.map((item, index) => (
              <div key={item.id} className="relative aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden shadow-sm border border-stone-200">
                <img src={item.previewUrl} alt="Anteprima" className="w-full h-full object-cover" />
                <button onClick={() => removeLocalPreview(item.id, item.previewUrl)} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-md">✕</button>
              </div>
            ))}
          </div>
          <button onClick={handleSaveAllMenu} disabled={uploading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg disabled:opacity-50">
            {uploading ? "Caricamento immagini..." : `💾 INVIA E CONVERTI CON IA (${localPreviews.length} PAGINE)`}
          </button>
        </div>
      )}

      {/* FEEDBACK ANALISI IA IN CORSO */}
      {analyzing && (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-3">
          <div className="text-2xl animate-spin inline-block">⏳</div>
          <h4 className="text-lg font-bold text-amber-800">L'algoritmo intelligente sta leggendo l'immagine...</h4>
          <p className="text-sm text-amber-600">Sto estraendo i veri nomi, descrizioni e prezzi per inserirli nella tabella sotto.</p>
        </div>
      )}

      {/* --- IL VERO E PROPRIO MENU EDITABILE E SISTEMABILE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6 mb-6">
          <div>
            <h3 className="text-2xl font-bold text-stone-800">Piatti & Listino Digitale</h3>
            <p className="text-sm text-stone-500 mt-0.5">Qui vedi il risultato della lettura dell'IA. Puoi modificare liberamente ogni campo.</p>
          </div>
          {menuItems.length > 0 && (
            <button 
              onClick={handleSaveUpdatedMenu} 
              disabled={savingMenu}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition"
            >
              {savingMenu ? "Salvataggio..." : "💾 SALVA MODIFICHE LISTINO"}
            </button>
          )}
        </div>

        {menuItems.length === 0 ? (
          <div className="p-12 text-center text-stone-400 border border-dashed rounded-xl">
            Nessun piatto convertito. Carica una foto in alto per attivare l'estrazione intelligente!
          </div>
        ) : (
          <div className="space-y-4">
            {menuItems.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 items-center">
                
                {/* Categoria */}
                <div className="md:col-span-2">
                  <input 
                    type="text" 
                    value={item.category || ''} 
                    onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-500 uppercase"
                    placeholder="CATEGORIA"
                  />
                </div>

                {/* Nome Piatto */}
                <div className="md:col-span-3">
                  <input 
                    type="text" 
                    value={item.name || ''} 
                    onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-800"
                    placeholder="Nome Piatto"
                  />
                </div>

                {/* Descrizione Ingredienti */}
                <div className="md:col-span-5">
                  <input 
                    type="text" 
                    value={item.description || ''} 
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600"
                    placeholder="Ingredienti, allergeni..."
                  />
                </div>

                {/* Prezzo € */}
                <div className="md:col-span-1 relative">
                  <input 
                    type="number" 
                    step="0.10"
                    value={item.price || ''} 
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                    className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm font-bold text-stone-800 pr-5"
                    placeholder="0.00"
                  />
                  <span className="absolute right-2 top-2.5 text-xs text-stone-400">€</span>
                </div>

                {/* Azione Elimina */}
                <div className="md:col-span-1 text-right">
                  <button onClick={() => deleteItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm font-bold">
                    Elimina
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
