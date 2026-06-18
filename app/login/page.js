'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Switch tra Login e Registrazione
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // LOGICA LOGIN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else router.push('/admin/dashboard');
    } else {
      // LOGICA REGISTRAZIONE
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Registrazione completata! Ora puoi accedere.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{isLogin ? 'Accedi' : 'Registrati'}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="border p-2" />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="border p-2" />
        <button type="submit" className="bg-blue-500 text-white p-2">{isLogin ? 'Accedi' : 'Registrati'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-sm text-blue-600 underline">
        {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
      </button>
    </div>
  );
}
