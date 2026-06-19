'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Manteniamo il tuo import centralizzato

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Errore di accesso: " + error.message);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        }
      });
      if (error) {
        setError("Errore di registrazione: " + error.message);
      } else {
        setMessage("Registrazione completata! Controlla la tua email per confermare l'account (guarda anche in spam).");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-black tracking-tight text-stone-900">
          SmartMenu<span className="text-emerald-600">.</span>
        </h2>
        <p className="mt-2 text-sm text-stone-500 font-medium">
          {isLogin ? 'Accedi alla tua area riservata' : 'Crea il tuo account ristoratore'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-stone-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-stone-700">Indirizzo Email</label>
              <input 
                type="email" 
                placeholder="nome@ristorante.it" 
                onChange={(e) => setEmail(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-stone-900 bg-white" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                onChange={(e) => setPassword(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-stone-900 bg-white" 
                required 
              />
            </div>

            {/* Messaggi di feedback grafici senza popup bloccanti */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm font-semibold rounded-lg border border-red-200">
                ⚠️ {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-lg border border-emerald-200">
                🎉 {message}
              </div>
            )}

            <div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#1C2D21] hover:bg-[#2d4a36] transition disabled:opacity-50"
              >
                {loading ? 'Elaborazione...' : isLogin ? 'Accedi' : 'Registrati'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }} 
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
            >
              {isLogin ? 'Non hai un account? Registrati gratis' : 'Hai già un account? Accedi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
