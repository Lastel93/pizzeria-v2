'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingData, setUpdatingData] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('3333333333'); // Telefono di default

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase.from('restaurants').select('*').eq('owner_id', user.id).single();
      if (data) {
        setRestaurant(data);
        setName(data.name || '');
        setAddress(data.address || '');
        setPhone(data.phone || '3395663620');
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  const handleUpdateData = async () => {
    try {
      setUpdatingData(true);
      const { error } = await supabase.from('restaurants').update({ name, address, phone }).eq('id', restaurant.id);
      if (error) throw error;
      alert("Dati aggiornati!");
    } catch (error) { alert("Errore: " + error.message); }
    finally { setUpdatingData(false); }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{restaurant.name}</h1>
      <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Nome Ristorante" />
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="Indirizzo" />
        <div className="flex gap-2">
           <span className="p-3 bg-stone-100 rounded-xl border">+39</span>
           <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-xl" placeholder="339..." />
        </div>
        <button onClick={handleUpdateData} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">Aggiorna Dati</button>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Link href={`/admin/menu/${restaurant.id}`} target="_blank" className="text-center py-4 bg-stone-900 text-white rounded-xl font-bold">👁️ Vedi Menu Online</Link>
        <Link href="/admin/menu" className="text-center py-4 bg-emerald-700 text-white rounded-xl font-bold">🍔 Gestisci Menu</Link>
      </div>
    </div>
  );
}
