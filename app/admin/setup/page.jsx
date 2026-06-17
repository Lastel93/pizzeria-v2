'use client'
import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export default function AdminSetup() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
    } catch (err) { console.error("Camera error:", err); }
  };

  const processImage = async () => {
    setLoading(true);
    const canvas = canvasRef.current;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0, 640, 480);
    const image = canvas.toDataURL('image/jpeg');

    const res = await fetch('/api/process-menu', {
      method: 'POST',
      body: JSON.stringify({ image })
    });
    const data = await res.json();
    setItems(data.menuItems || []);
    setLoading(false);
  };

  const saveToSupabase = async () => {
    const { error } = await supabase.from('menu').insert(items);
    if (!error) alert("Menu digitalizzato con successo!");
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-[#FAF8F5] min-h-screen">
      <h1 className="text-2xl font-black mb-6">Setup Menù</h1>
      
      {/* AREA CAMERA */}
      <div className="space-y-4 mb-8">
        <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl bg-black h-64 object-cover" />
        <div className="flex gap-2">
          <button onClick={startCamera} className="flex-1 p-3 bg-stone-800 text-white rounded-xl">Accendi Cam</button>
          <button onClick={processImage} className="flex-1 p-3 bg-red-600 text-white rounded-xl font-bold">Scatta & Analizza</button>
        </div>
      </div>

      {/* AREA VERIFICA */}
      {loading && <p className="animate-pulse text-center">L'AI sta leggendo il menù...</p>}
      
      {items.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-bold">Conferma i dati estratti:</h2>
          {items.map((item, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-stone-200">
              <input value={item.name} onChange={(e) => {
                const newItems = [...items]; newItems[i].name = e.target.value; setItems(newItems);
              }} className="w-full font-bold bg-transparent" />
              <input value={item.price} onChange={(e) => {
                const newItems = [...items]; newItems[i].price = e.target.value; setItems(newItems);
              }} className="w-full text-red-600 bg-transparent" />
            </div>
          ))}
          <button onClick={saveToSupabase} className="w-full p-4 bg-green-700 text-white rounded-xl font-bold">Salva nel Database</button>
        </div>
      )}
      <canvas ref={canvasRef} width="640" height="480" className="hidden" />
    </div>
  );
}
