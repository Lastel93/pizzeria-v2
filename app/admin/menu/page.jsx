const runAIAnalysis = async (imageUrl) => {
    try {
      setAnalyzing(true);
      const response = await fetch('/api/parse-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      
      const piattiEstratti = await response.json();
      
      // Mappatura diretta: nessuna logica, solo passaggio dei dati
      const piattiPronti = piattiEstratti.map(p => ({ 
        name: p.name || "Senza nome",
        description: p.description || "",
        price: String(p.price || ""),
        category: p.category || "Generico",
        restaurant_id: restaurant.id
      }));

      // Inserimento massivo nel database
      const { error } = await supabase.from('menu_items').insert(piattiPronti);
      if (error) throw error;
      
      fetchMenuItems(restaurant.id);
    } catch (err) {
      alert("Errore: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };
