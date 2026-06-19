'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardMenu({ items, onUpdate }) {
  const [selectedItems, setSelectedItems] = useState([]);

  // Seleziona/Deseleziona tutto
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  // Seleziona singolo
  const toggleItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Cancellazione massiva su Supabase
  const deleteSelected = async () => {
    if (!confirm(`Sei sicuro di voler eliminare ${selectedItems.length} elementi?`)) return;

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .in('id', selectedItems);

    if (!error) {
      setSelectedItems([]);
      onUpdate(); // Funzione che ricarica i dati dalla tabella
    }
  };

  return (
    <div>
      {/* Barra Azioni */}
      <div className="flex gap-4 mb-4 p-4 bg-stone-100 rounded-lg">
        <button onClick={toggleSelectAll} className="px-4 py-2 bg-stone-200 rounded">
          {selectedItems.length === items.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
        </button>
        
        {selectedItems.length > 0 && (
          <button 
            onClick={deleteSelected} 
            className="px-4 py-2 bg-red-600 text-white rounded font-bold"
          >
            Elimina Selezionati ({selectedItems.length})
          </button>
        )}
      </div>

      {/* Lista Menu */}
      <table className="w-full">
        <tbody>
          {items.map(item => (
            <tr key={item.id} className={selectedItems.includes(item.id) ? 'bg-red-50' : ''}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.id)} 
                  onChange={() => toggleItem(item.id)} 
                />
              </td>
              <td className="p-2">{item.name}</td>
              <td className="p-2">€{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
