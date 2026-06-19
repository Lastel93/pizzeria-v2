'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Direttiva per evitare errori di build su Vercel
export const dynamic = 'force-dynamic';

export default function DashboardMenu() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('menu_items').select('*');
    if (data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleSelectAll = () => {
    if (selectedItems?.length === items?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedItems.length} elementi?`)) return;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .in('id', selectedItems);

    if (!error) {
      setSelectedItems([]);
      fetchItems(); 
    } else {
      alert("Errore durante l'eliminazione");
    }
  };

  if (loading) return <div className="p-10">Caricamento...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-6 uppercase text-red-700">Selettore Menu</h1>

      <div className="flex gap-4 mb-6 p-4 bg-stone-100 rounded-lg">
        <button onClick={toggleSelectAll} className="px-4 py-2 bg-stone-200 rounded font-bold">
          {selectedItems?.length === items?.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
        </button>
        
        {selectedItems?.length > 0 && (
          <button onClick={deleteSelected} className="px-4 py-2 bg-red-600 text-white rounded font-bold">
            Elimina Selezionati ({selectedItems.length})
          </button>
        )}
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2"></th>
            <th className="p-2">Nome</th>
            <th className="p-2">Categoria</th>
          </tr>
        </thead>
        <tbody>
          {items?.map(item => (
            <tr key={item.id} className={selectedItems.includes(item.id) ? 'bg-red-50' : ''}>
              <td className="p-2">
                <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleItem(item.id)} />
              </td>
              <td className="p-2">{item.name}</td>
              <td className="p-2 italic">{item.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
