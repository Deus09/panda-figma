// Film önerisi için Gemini AI entegrasyonu
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// TMDB API URL
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Film önerisi response tipi
export interface MovieSuggestion {
  title: string;
  year: number;
  tmdbId: number;
  poster_path: string;
}

/**
 * Gemini'den gelen raw text'i parse ederek film adlarını çıkarır
 */
function parseMovieTitles(rawText: string): string[] {
  if (!rawText) return [];
  
  // Numaralandırılmış satırları bul (1. Film Adı (Yıl) formatında)
  const movieLines = rawText.match(/^(\d+\.\s.*)$/gm);
  if (!movieLines) return [];

  return movieLines
    .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Numaralandırmayı kaldır
    .filter(line => line.length > 0); // Boş satırları filtrele
}

/**
 * TMDB'de film arama yapar
 */
async function searchTmdb(query: string): Promise<any> {
  const tmdbApiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!tmdbApiKey) {
    throw new Error('TMDB API anahtarı tanımlanmamış');
  }

  // Yıl bilgisini çıkar
  let year = '';
  const yearMatch = query.match(/\((\d{4})\)/);
  if (yearMatch) year = yearMatch[1];
  const movieTitle = query.replace(/\s\(\d{4}\)$/, '').trim();

  let url = `${TMDB_API_URL}/search/movie?query=${encodeURIComponent(movieTitle)}&language=tr-TR&api_key=${tmdbApiKey}`;
  if (year) url += `&year=${year}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`TMDB arama başarısız: ${query}`);
    return null;
  }
  
  const data = await response.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

/**
 * Kullanıcının tarifiine göre Gemini AI'dan film önerileri alır
 * @param promptText - Kullanıcının film tarifi
 * @param excludedMovies - Daha önce önerilen filmlerin listesi (opsiyonel)
 * @returns Film önerileri dizisi
 */
export const getMovieSuggestions = async (
  promptText: string,
  excludedMovies?: MovieSuggestion[]
): Promise<MovieSuggestion[]> => {
  try {
    let prompt = `Lütfen kullanıcının şu isteğine göre birbirinden farklı 9 film öner: "${promptText}".`;

    // Dışlama mantığını ekle
    if (excludedMovies && excludedMovies.length > 0) {
      const excludedTitles = excludedMovies.map(movie => `${movie.title} (${movie.year})`).join(', ');
      prompt += `\n\nAşağıdaki filmleri kesinlikle önerme: ${excludedTitles}.`;
    }

    prompt += `\n\nSadece numaralandırılmış bir liste halinde, her satırda bir tane olacak şekilde, filmlerin orijinal adını ve parantez içinde çıkış yılını döndür. Başka hiçbir açıklama, selamlama veya ek metin ekleme.

Örneğin:
1. The Dark Knight (2008)
2. Inception (2010)
3. Pulp Fiction (1994)
4. The Matrix (1999)
5. Interstellar (2014)
6. The Shawshank Redemption (1994)
7. Fight Club (1999)
8. Forrest Gump (1994)
9. The Godfather (1972)`;

    // Gemini API'ye istek gönder
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API anahtarı tanımlanmamış. VITE_GEMINI_API_KEY environment variable\'ını ayarlayın.');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 1.0,
          topK: 40,
          topP: 0.95,
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
    console.log('Gemini raw response:', responseText);
    
    // Film adlarını parse et
    const movieTitles = parseMovieTitles(responseText);
    console.log('Parsed movie titles:', movieTitles);

    if (movieTitles.length < 9) {
      console.warn(`Gemini'den ${movieTitles.length} film adı alındı, 9 bekleniyordu`);
    }

    // TMDB'de her film için arama yap
    const moviePromises = movieTitles.map(title => searchTmdb(title));
    const tmdbResults = await Promise.all(moviePromises);
    
    // Bulunan filmleri filtrele ve formatla
    const foundMovies = tmdbResults
      .filter(movie => movie !== null)
      .map(movie => ({
        title: movie.title,
        year: new Date(movie.release_date).getFullYear(),
        tmdbId: movie.id,
        poster_path: movie.poster_path
      }));

    console.log(`${foundMovies.length} film TMDB'de bulundu`);

    if (foundMovies.length === 0) {
      throw new Error('Önerilen filmlerin hiçbiri TMDB veritabanında bulunamadı. Lütfen tekrar deneyin.');
    }

    return foundMovies;

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
