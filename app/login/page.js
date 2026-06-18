// app/login/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Importiamo il client centralizzato

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("Errore Login: " + error.message);
      } else {
        router.push('/admin/dashboard');
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert("Errore Registrazione: " + error.message);
      } else {
        alert("Registrazione completata! Controlla la tua email o accedi.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">{isLogin ? 'Accedi al tuo Ristorante' : 'Registrati'}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          className="border p-2 rounded" 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          className="border p-2 rounded" 
          required 
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {isLogin ? 'Accedi' : 'Registrati'}
        </button>
      </form>
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        className="mt-4 text-sm text-blue-600 underline"
      >
        {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
      </button>
    </div>
  );
}
