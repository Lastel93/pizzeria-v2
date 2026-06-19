import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "URL immagine mancante" }, { status: 400 });
    }

    // Chiamata all'API di OpenAI (richiede OPENAI_API_KEY nel file .env.local)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Veloce ed economico per la lettura testi/OCR
        response_format: { type: "json_object" }, // Forza la risposta in JSON puro
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analizza questa immagine di un menu cartaceo ed estrai tutti i piatti presenti. 
                Ritorna ESCLUSIVAMENTE un oggetto JSON con una chiave "menu" contenente un array di oggetti.
                Ogni oggetto deve avere questi campi esatti:
                - "name": il nome del piatto o della bevanda
                - "description": gli ingredienti o la descrizione (se presenti, altrimenti stringa vuota)
                - "price": il prezzo come stringa. Se sono presenti più prezzi per lo stesso piatto (es. piccolo/grande), scrivili separati da una barra (es: "5.00/8.00"). Se non presente metti "0".
                - "category": la categoria del piatto (es. Pizze, Primi, Bevande, Dolci)
                
                Non inventare piatti. Estrai solo ciò che è visibile.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Errore API Vision: ${errorText}` }, { status: 500 });
    }

    const aiData = await response.json();
    const parsedContent = JSON.parse(aiData.choices[0].message.content);

    // Restituisce l'array di piatti reali estratti dall'immagine
    return NextResponse.json(parsedContent.menu || []);

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
