'use client';
import { useState } from 'react';
import { useRestaurant } from '../../../context/RestaurantContext';
import { supabase } from '../../../lib/supabase';

export default function Dashboard() {
  const { restaurant, loading } = useRestaurant();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      // 1. Carica il file nel bucket 'menu-docs'
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('menu-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Ottieni l'URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('menu-docs')
        .getPublicUrl(fileName);

      // 3. Salva il record nella tabella 'menu_documents'
      const { error: dbError } = await supabase
        .from('menu_documents')
        .insert([{ 
          restaurant_id: restaurant.id, 
          file_url: publicUrl, 
          type: 'menu' 
        }]);

      if (dbError) throw dbError;

      alert("File caricato con successo!");
      window.location.reload();
    } catch (error) {
      alert("Errore durante l'upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Gestione {restaurant?.name}</h1>
      
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm mt-6">
        <h3 className="font-bold text-lg mb-4">I tuoi Documenti</h3>
        
        <input 
          type="file" 
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1C2D21] file:text-white"
        />
        {uploading && <p className="mt-2 text-sm">Caricamento in corso...</p>}
      </div>
    </div>
  );
}
