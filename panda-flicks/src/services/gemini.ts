const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'GEMINI_API_KEY_PLACEHOLDER';
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com';

export async function improveComment(comment: string, movieTitle?: string): Promise<string> {
  const prompt = `Aşağıdaki film yorumu bir izleyici tarafından yazıldı. Film: ${movieTitle}. Lütfen bu yorumu amatör bir film eleştirmeni gibi daha detaylı, akıcı ve profesyonel bir şekilde geliştir. maksimum 200-250 arasında karakter kullan.Yapay bir yorum yapma kullanıcının yazdığı yorumun ana bağlamından kopma:\n\n"${comment}"`;
  const url = `${GEMINI_API_URL}/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Gemini API error');
  const data = await res.json();
  const improved = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return improved;
} 