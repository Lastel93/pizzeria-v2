'use client';
import { useState, useEffect } from 'react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { supabase } from '../../../lib/supabase';

export default function Dashboard() {
  const { restaurant, loading } = useRestaurant();
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Recupera i documenti quando il componente viene montato o quando il ristorante cambia
  useEffect(() => {
    if (restaurant) {
      fetchDocuments();
    }
  }, [restaurant]);

  const fetchDocuments = async () => {
    if (!restaurant) return;
    
    const { data, error } = await supabase
      .from('menu_documents')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Errore nel recupero documenti:", error);
    } else {
      setDocuments(data || []);
    }
  };

  const handleFileUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // 1. Carica il file nel bucket 'menu-docs'
      // Creiamo un percorso univoco basato sull'ID del ristorante
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Ottieni l'URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('menu-docs')
        .getPublicUrl(fileName);

      // 3. Salva il record nel database
      const { error: dbError } = await supabase
        .from('menu_documents')
        .insert([{ 
          restaurant_id: restaurant.id, 
          file_url: publicUrl, 
          type: 'menu' 
        }]);

      if (dbError) throw dbError;

      alert("File caricato con successo!");
      // Ricarichiamo la lista dopo l'upload
      fetchDocuments();
    } catch (error) {
      alert("Errore durante l'upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10">Caricamento in corso...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Gestione {restaurant?.name}</h1>
      <p className="text-stone-600 mb-8">Benvenuto nella tua area di amministrazione.</p>
      
      {/* SEZIONE UPLOAD */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <h3 className="font-bold text-lg mb-4">Carica Nuovo Documento</h3>
        <input 
          type="file" 
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1C2D21] file:text-white file:cursor-pointer hover:file:bg-[#2d4a36]"
        />
        {uploading && <p className="mt-2 text-sm text-blue-600">Caricamento in corso...</p>}
      </div>

      {/* SEZIONE LISTA FILE */}
      <div className="mt-8">
        <h3 className="font-bold text-lg mb-4">Documenti Caricati</h3>
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <a 
              key={doc.id} 
              href={doc.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 bg-white border border-stone-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition"
            >
              <div className="flex justify-between">
                <span>Documento caricato il {new Date(doc.created_at).toLocaleDateString()}</span>
                <span className="text-blue-600 font-bold">Apri</span>
              </div>
            </a>
          ))}
          {documents.length === 0 && (
            <div className="p-4 text-center border-2 border-dashed border-stone-200 rounded-lg text-stone-400">
              Nessun documento caricato finora.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
