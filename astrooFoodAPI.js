// /api/astrofood-chat.js
export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  try {
    const body = await req.json();
    const { dish, lang = "fr", sign = "aries" } = body;

    const systemPrompt = `
Tu es Chef-AI pour AstroFood. Tu donnes des explications courtes de préparation,
dans la langue demandée (${lang}), pour le plat "${dish}" adapté au signe ${sign}.
Structure : (1) intro très courte, (2) ingrédients, (3) étapes.
`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Donne-moi la recette détaillée de ${dish} en ${lang}.` }
        ]
      })
    });

    const data = await resp.json();

    return new Response(JSON.stringify({
      ok: true,
      answer: data.choices?.[0]?.message?.content ?? "Aucune réponse"
    }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500
    });
  }
}
