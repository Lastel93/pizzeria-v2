'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function DashboardPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

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
        fetchDocuments(data.id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const fetchDocuments = async (restId) => {
    const { data } = await supabase
      .from('menu_documents')
      .select('*')
      .eq('restaurant_id', restId)
      .order('created_at', { ascending: false });
    if (data) setDocuments(data);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !restaurant) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('menu-docs').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('menu-docs').getPublicUrl(fileName);

      await supabase.from('menu_documents').insert([{ 
        restaurant_id: restaurant.id, 
        file_url: publicUrl, 
        type: 'menu' 
      }]);

      fetchDocuments(restaurant.id);
    } catch (error) {
      alert("Errore: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-stone-500 animate-pulse">Caricamento pannello...</div>;
  }

  if (!restaurant) {
    return <div className="p-10 text-center text-stone-500 mt-20">Nessun ristorante configurato.</div>;
  }

  return (
    <div className="p-10 max-w-6xl mx-auto w-full">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-stone-500 mt-2">Benvenuto nella gestione di <span className="font-semibold text-stone-800">{restaurant.name}</span></p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonna Sinistra: Area Upload */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-10">
            <h3 className="text-lg font-bold text-stone-800 mb-2">Carica nuovo file</h3>
            <p className="text-sm text-stone-500 mb-6">Carica una foto o un PDF. Verrà mostrato subito online.</p>
            
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-stone-300 border-dashed rounded-xl cursor-pointer bg-stone-50 hover:bg-stone-100 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="text-sm text-stone-600 font-medium">Clicca per caricare</p>
              </div>
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            </label>
            {uploading && <div className="mt-4 text-center text-sm font-medium text-emerald-600 animate-pulse">Caricamento in corso...</div>}
          </div>
        </div>

        {/* Colonna Destra: Lista File Attivi */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-stone-800">I tuoi documenti attivi</h3>
              <span className="bg-[#1C2D21] text-white text-xs font-semibold px-3 py-1 rounded-full">{documents.length} File</span>
            </div>

            <div className="flex flex-col gap-3">
              {documents.length === 0 ? (
                <div className="p-8 text-center text-stone-400 border border-dashed border-stone-200 rounded-xl">
                  Nessun documento caricato.
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="group flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:border-[#1C2D21] hover:shadow-md transition bg-stone-50 hover:bg-white">
                    <div>
                      <p className="font-semibold text-stone-800">Menu / Volantino</p>
                      <p className="text-sm text-stone-500">
                        Caricato il {new Date(doc.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold text-[#1C2D21] bg-[#1C2D21]/10 hover:bg-[#1C2D21]/20 rounded-lg transition">
                      Apri
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
