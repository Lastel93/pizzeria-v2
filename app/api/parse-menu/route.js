import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    if (!imageUrl) return NextResponse.json({ error: "URL mancante" }, { status: 400 });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0,
        max_tokens: 4096,
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di trascrizione menu. Il tuo unico compito è ESTRARRE LETTERALMENTE ogni riga di testo che rappresenta un piatto o una bevanda nell'immagine.
            REGOLE FERREE:
            1. Ritorna un JSON con una chiave "menu" che contiene un array PIATTO di oggetti.
            2. Ogni oggetto deve avere: "name", "description", "price", "category".
            3. Se il prezzo non è leggibile, usa stringa vuota "".
            4. Se la descrizione non è presente, usa stringa vuota "".
            5. Mantieni i nomi piatti esattamente come scritti.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: "Trascrivi ogni piatto. Assegna tu la categoria in base al contesto. Ritorna solo il JSON." },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
            ]
          }
        ]
      })
    });

    const aiData = await response.json();
    const content = aiData.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '');
    const data = JSON.parse(content);
    
    return NextResponse.json(data.menu || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
