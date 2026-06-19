'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Questa direttiva forza Next.js a caricare la pagina solo lato client, risolvendo l'errore di build
export const dynamic = 'force-dynamic';

export default function DashboardMenu() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carica i dati
  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('menu_items').select('*');
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Logica Seleziona Tutto
  const toggleSelectAll = () => {
    if (selectedItems?.length === items?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  // Logica Seleziona Singolo
  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Cancellazione Massiva
  const deleteSelected = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedItems.length} elementi?`)) return;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .in('id', selectedItems);

    if (!error) {
      setSelectedItems([]);
      fetchItems(); // Ricarica la lista dopo l'eliminazione
    } else {
      alert("Errore durante l'eliminazione");
    }
  };

  if (loading) return <div className="p-10">Caricamento dashboard...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black mb-6">Gestione Menu</h1>

      {/* Barra Azioni */}
      <div className="flex gap-4 mb-6 p-4 bg-stone-100 rounded-lg items-center">
        <button 
          onClick={toggleSelectAll} 
          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 rounded font-bold"
        >
          {selectedItems?.length === items?.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
        </button>
        
        {selectedItems?.length > 0 && (
          <button 
            onClick={deleteSelected} 
            className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
          >
            Elimina Selezionati ({selectedItems.length})
          </button>
        )}
      </div>

      {/* Tabella */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">#</th>
            <th className="p-2">Nome</th>
            <th className="p-2">Prezzo</th>
            <th className="p-2">Categoria</th>
          </tr>
        </thead>
        <tbody>
          {items?.map(item => (
            <tr 
              key={item.id} 
              className={`border-b ${selectedItems.includes(item.id) ? 'bg-red-50' : ''}`}
            >
              <td className="p-2">
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.id)} 
                  onChange={() => toggleItem(item.id)} 
                />
              </td>
              <td className="p-2">{item.name}</td>
              <td className="p-2">€{item.price}</td>
              <td className="p-2 italic text-stone-500">{item.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
