import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0,
        messages: [
          {
            role: 'system',
            content: `Sei un trascrittore di menu. Ritorna un JSON con una chiave "menu" che contiene un array PIATTO di oggetti. 
            Ogni oggetto deve avere: "name", "description", "price", "category". 
            NON raggruppare, non fare liste annidate. Ogni voce è un oggetto separato che include la sua categoria.
            Esempio: {"menu": [{"name": "Pizza", "description": "...", "price": "...", "category": "Pizze"}]}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: "Trascrivi ogni piatto. Assegna tu la categoria in base al contesto." },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
            ]
          }
        ]
      })
    });

    const aiData = await response.json();
    const content = aiData.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '');
    const data = JSON.parse(content);
    
    // Ritorna direttamente l'array, senza logica di trasformazione complessa
    return NextResponse.json(data.menu || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
