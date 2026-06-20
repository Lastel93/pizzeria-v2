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
        // Cambio modello qui
        model: 'gpt-4o-mini', 
        temperature: 0,
        max_tokens: 2048, 
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di trascrizione menu. 
REGOLE:
1. Ritorna un JSON con "menu" contenente oggetti con: "name", "description", "price1", "price2", "price3", "category".
2. Se un prezzo non esiste, metti "0".
3. Estrai ogni variante di prezzo che trovi sulla riga del piatto.
4. Se non capisci la category, metti "Varie".`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: "Trascrivi ogni piatto. Assegna tu la categoria in base al contesto. Ritorna solo il JSON." },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } } // Impostato a 'low' per risparmiare ancora più token
            ]
          }
        ]
      })
    });

    const aiData = await response.json();
    
    // Controllo di sicurezza se l'IA risponde con errore
    if (!aiData.choices || !aiData.choices[0]) {
        throw new Error(aiData.error?.message || "Errore chiamata OpenAI");
    }

    const content = aiData.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '');
    const data = JSON.parse(content);
    
    return NextResponse.json(data.menu || []);
  } catch (error) {
    console.error("Errore API parse-menu:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
