// Film önerisi için Gemini AI entegrasyonu
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Film önerisi response tipi
export interface MovieSuggestion {
  title: string;
  year: number;
  tmdbId: number;
}

/**
 * Kullanıcının tarifiine göre Gemini AI'dan film önerileri alır
 * @param promptText - Kullanıcının film tarifi
 * @param excludedMovies - Daha önce önerilen filmlerin TMDB ID'leri (opsiyonel)
 * @returns Film önerileri dizisi
 */
export const getMovieSuggestions = async (
  promptText: string,
  excludedMovies?: number[]
): Promise<MovieSuggestion[]> => {
  try {
    // Prompt metnini oluştur
    let prompt = `Kullanıcının şu tarifine uyan 9 adet film öner: "${promptText}".

Cevabını, içinde title, year ve tmdbId alanları olan bir JSON array formatında ver.
Sadece JSON formatında cevap ver, başka açıklama yapma.

Format örneği:
[
  {
    "title": "Inception",
    "year": 2010,
    "tmdbId": 27205
  },
  {
    "title": "Interstellar",
    "year": 2014,
    "tmdbId": 157336
  }
]`;

    // Eğer excludedMovies listesi varsa ve boş değilse, prompt'a ekle
    if (excludedMovies && excludedMovies.length > 0) {
      prompt += `\n\nLütfen ID'leri şu listede olan filmleri önerme: [${excludedMovies.join(', ')}].`;
    }

    // Gemini API'ye istek gönder
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API isteği başarısız: ${response.status}`);
    }

    const data = await response.json();

    // API yanıtını kontrol et
    if (
      !data.candidates ||
      !Array.isArray(data.candidates) ||
      data.candidates.length === 0 ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0].text
    ) {
      throw new Error('Gemini API\'den geçersiz yanıt alındı');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // JSON response'u parse et
    let movieSuggestions: MovieSuggestion[];
    try {
      // Gemini bazen JSON'u code block içinde döndürebilir, temizle
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      movieSuggestions = JSON.parse(cleanedResponse);
      
      // Yanıtın array olduğunu ve gerekli alanları içerdiğini kontrol et
      if (!Array.isArray(movieSuggestions)) {
        throw new Error('Yanıt array formatında değil');
      }
      
      // Her filmin gerekli alanları olduğunu kontrol et
      movieSuggestions.forEach((movie, index) => {
        if (!movie.title || !movie.year || !movie.tmdbId) {
          throw new Error(`Film ${index + 1} eksik alanlara sahip`);
        }
        
        // Veri tiplerini kontrol et
        if (typeof movie.title !== 'string' || 
            typeof movie.year !== 'number' || 
            typeof movie.tmdbId !== 'number') {
          throw new Error(`Film ${index + 1} yanlış veri tiplerine sahip`);
        }
      });
      
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Film önerilerini parse ederken hata oluştu');
    }

    console.log(`${movieSuggestions.length} film önerisi alındı`);
    return movieSuggestions;

  } catch (error) {
    console.error('Film önerisi alınırken hata:', error);
    throw error;
  }
};

/**
 * Film önerisi isteğini test etmek için yardımcı fonksiyon
 * @param promptText - Test edilecek tarif
 */
export const testMovieSuggestions = async (promptText: string): Promise<void> => {
  try {
    console.log('Film önerisi testi başlıyor...');
    console.log('Prompt:', promptText);
    
    const suggestions = await getMovieSuggestions(promptText);
    
    console.log('Alınan öneriler:');
    suggestions.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.year}) - TMDB ID: ${movie.tmdbId}`);
    });
    
  } catch (error) {
    console.error('Test hatası:', error);
  }
};
