'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dbDocuments, setDbDocuments] = useState([]); // File già salvati nel DB
  
  // Stato cruciale: contiene le foto scattate/scelte al momento (Anteprime locali)
  const [localPreviews, setLocalPreviews] = useState([]);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (data) {
        setRestaurant(data);
        fetchUploadedDocuments(data.id);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Recupera i vecchi menu già salvati su Supabase
  const fetchUploadedDocuments = async (restId) => {
    const { data } = await supabase
      .from('menu_documents')
      .select('*')
      .eq('restaurant_id', restId)
      .order('created_at', { ascending: false });
    if (data) setDbDocuments(data);
  };

  // Gestisce l'aggiunta di foto/file alla lista delle anteprime locali
  const handleFileSelection = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Genera gli URL temporanei per vedere subito le foto scattate nel browser
    const newPreviews = files.map(file => ({
      file: file,
      previewUrl: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9) // ID temporaneo per le chiavi React
    }));

    // Li unisce a quelli già scattati in precedenza
    setLocalPreviews(prev => [...prev, ...newPreviews]);
  };

  // Rimuove uno scatto dall'anteprima se è venuto male
  const removeLocalPreview = (idToRemove, urlToRelease) => {
    setLocalPreviews(prev => prev.filter(item => item.id !== idToRemove));
    URL.revokeObjectURL(urlToRelease); // Pulizia memoria del browser
  };

  // Prende tutti gli scatti in anteprima e li carica in blocco su Supabase
  const handleSaveAllMenu = async () => {
    if (!localPreviews.length || !restaurant) return;

    try {
      setUploading(true);

      // Eseguiamo i caricamenti in parallelo per massima velocità
      const uploadPromises = localPreviews.map(async (item) => {
        const fileExt = item.file.name.split('.').pop() || 'jpg';
        const fileName = `${restaurant.id}/${Date.now()}_${item.id}.${fileExt}`;

        // 1. Upload nello Storage
        const { error: storageError } = await supabase.storage
          .from('menu-docs')
          .upload(fileName, item.file);

        if (storageError) throw storageError;

        // 2. Genera URL pubblico
        const { data: { publicUrl } } = supabase.storage
          .from('menu-docs')
          .getPublicUrl(fileName);

        // 3. Ritorna l'oggetto pronto per l'inserimento nel database
        return {
          restaurant_id: restaurant.id,
          file_url: publicUrl,
          type: 'menu'
        };
      });

      const documentsToInsert = await Promise.all(uploadPromises);

      // 4. Scrittura di massa nel Database delle righe dei menu
      const { error: dbError } = await supabase
        .from('menu_documents')
        .insert(documentsToInsert);

      if (dbError) throw dbError;

      // Pulizia finale
      localPreviews.forEach(item => URL.revokeObjectURL(item.previewUrl));
      setLocalPreviews([]);
      alert("Tutte le pagine del menu sono state salvate!");
      fetchUploadedDocuments(restaurant.id);
    } catch (error) {
      alert("Errore durante il salvataggio: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-stone-500">Caricamento sezione menu...</div>;
  if (!restaurant) return <div className="p-10 text-center text-stone-500">Configura prima il ristorante nella Dashboard.</div>;

  return (
    <div className="p-10 max-w-5xl mx-auto w-full">
      
      {/* Torna alla Dashboard */}
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-sm font-semibold text-[#1C2D21] hover:underline flex items-center gap-1">
          ← Torna alla Dashboard
        </Link>
      </div>

      <header className="mb-10">
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">Gestione Menu</h1>
        <p className="text-stone-500 mt-1">Scatta le foto alle pagine del tuo menu cartaceo o carica i file digitali.</p>
      </header>

      {/* SEZIONE PULSANTI DI AZIONE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        
        {/* PULSANTE FOTOCAMERA (Ottimizzato per Mobile) */}
        <label className="flex items-center justify-center gap-3 p-6 bg-[#1C2D21] text-white rounded-2xl cursor-pointer hover:bg-[#2d4a36] shadow-md transition transform active:scale-95 text-center font-bold text-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          📸 USA FOTOCAMERA
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" /* Forza l'apertura della fotocamera posteriore su smartphone */
            onChange={handleFileSelection} 
            className="hidden" 
          />
        </label>

        {/* PULSANTE CARICA FILE (Galleria o PDF) */}
        <label className="flex items-center justify-center gap-3 p-6 bg-white text-[#1C2D21] border-2 border-[#1C2D21] rounded-2xl cursor-pointer hover:bg-stone-50 shadow-sm transition transform active:scale-95 text-center font-bold text-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          📁 CARICA DA GALLERIA / PDF
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            multiple /* Permette la selezione multipla */
            onChange={handleFileSelection} 
            className="hidden" 
          />
        </label>
      </div>

      {/* GRIGLIA ANTEPRIMA SCATTI CORRENTI (La vedi solo se hai scattato qualcosa) */}
      {localPreviews.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-emerald-500 p-6 mb-10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-800">Anteprima scatti correnti</h3>
              <p className="text-sm text-stone-500 mt-0.5">Verifica di aver fotografato tutte le sezioni prima di salvare.</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
              {localPreviews.length} Foto pronte
            </span>
          </div>

          {/* Griglia foto scattate */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            {localPreviews.map((item, index) => (
              <div key={item.id} className="relative aspect-[3/4] bg-stone-100 rounded-xl overflow-hidden shadow-sm group border border-stone-200">
                <img src={item.previewUrl} alt="Anteprima menu" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 text-white font-bold text-xs px-2 py-1 rounded-md">
                  Pag. {index + 1}
                </div>
                {/* Tasto per eliminare lo scatto venuto male */}
                <button 
                  onClick={() => removeLocalPreview(item.id, item.previewUrl)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Bottone per confermare l'invio definitivo */}
          <button
            onClick={handleSaveAllMenu}
            disabled={uploading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <span className="animate-pulse">Salvataggio del Menu in corso...</span>
            ) : (
              <>💾 CONFERMA E PUBBLICA ({localPreviews.length}) PAGINE ONLINE</>
            )}
          </button>
        </div>
      )}

      {/* DOCUMENTI DIETRO IN ARCHIVIO (Già online) */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <h3 className="text-xl font-bold text-stone-800 mb-6">Menu attualmente pubblicati</h3>
        
        {dbDocuments.length === 0 ? (
          <div className="p-10 text-center text-stone-400 border border-dashed rounded-xl">
            Nessun menu presente online. Fai il tuo primo scatto in alto!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dbDocuments.map((doc, idx) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-xl bg-stone-50 hover:bg-white transition">
                <div>
                  <p className="font-bold text-stone-800">Documento Pubblicato #{dbDocuments.length - idx}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Online dal {new Date(doc.created_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-stone-200 text-stone-800 text-sm font-bold rounded-lg hover:bg-stone-300 transition">
                  Visualizza File
                </title>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
