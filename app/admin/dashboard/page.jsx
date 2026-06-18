'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function Dashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // 1. Appena la pagina carica, cerchiamo il ristorante dell'utente
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

  // 2. Funzione per caricare la lista file
  const fetchDocuments = async (restId) => {
    const { data } = await supabase
      .from('menu_documents')
      .select('*')
      .eq('restaurant_id', restId)
      .order('created_at', { ascending: false });
    
    if (data) setDocuments(data);
  };

  // 3. Funzione di Upload (quella che ti dava errore)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !restaurant) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-docs')
        .getPublicUrl(fileName);

      await supabase.from('menu_documents').insert([{ 
        restaurant_id: restaurant.id, 
        file_url: publicUrl, 
        type: 'menu' 
      }]);

      alert("File caricato!");
      fetchDocuments(restaurant.id);
    } catch (error) {
      alert("Errore: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10">Caricamento in corso...</div>;

  // Se non esiste ristorante, mostriamo il form di creazione (che avevi prima)
  if (!restaurant) return <div className="p-10">Nessun ristorante configurato.</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestione {restaurant.name}</h1>
      
      {/* Upload */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Carica Menu o Logo</h3>
        <input 
          type="file" 
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-[#1C2D21] file:text-white"
        />
      </div>

      {/* Lista */}
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">Documenti Caricati</h3>
        {documents.map((doc) => (
          <a key={doc.id} href={doc.file_url} target="_blank" className="block p-3 mb-2 bg-white border rounded-lg hover:border-blue-500">
            File caricato il {new Date(doc.created_at).toLocaleDateString()}
          </a>
        ))}
      </div>
    </div>
  );
}
