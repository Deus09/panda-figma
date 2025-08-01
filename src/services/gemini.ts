import i18n from '../i18n';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Dil kodlarını Gemini için uygun formata çevir
const getLanguageCode = (language: string): string => {
  switch (language) {
    case 'tr':
      return 'Turkish';
    case 'en':
      return 'English';
    case 'es':
      return 'Spanish';
    default:
      return 'Turkish';
  }
};

export const improveComment = async (comment: string, movieTitle: string): Promise<string> => {
  try {
    const currentLanguage = i18n.language || 'tr';
    const languageCode = getLanguageCode(currentLanguage);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful assistant that improves movie reviews. Please improve the following review for the movie "${movieTitle}" while keeping the same meaning and sentiment, but making it more engaging and well-written. The review is: "${comment}". Please respond in ${languageCode} language.`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to improve comment');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error improving comment:', error);
    throw error;
  }
};

export const chatWithCast = async (
  message: string, 
  castMember: { name: string; character: string }, 
  movieTitle: string
): Promise<string> => {
  try {
    const currentLanguage = i18n.language || 'tr';
    const languageCode = getLanguageCode(currentLanguage);
    
    const prompt = `You are role-playing as "${castMember.character}" from the movie "${movieTitle}". Stay in character and answer the user's message as "${castMember.character}". If you don't know something, improvise as the character would. User's message: "${message}". Please respond in ${languageCode} language.`;

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
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from cast member');
    }

    const data = await response.json();

    // Yanıtı kontrol et
    if (
      !data.candidates ||
      !Array.isArray(data.candidates) ||
      data.candidates.length === 0 ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0].text
    ) {
      return currentLanguage === 'tr' 
        ? "Üzgünüm, oyuncu şu anda yanıt vermekte zorlanıyor. Lütfen daha sonra tekrar deneyin veya farklı bir soru sorun."
        : currentLanguage === 'es'
        ? "Lo siento, el actor está teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo más tarde o haz una pregunta diferente."
        : "Sorry, the cast member is having trouble responding right now. Please try again later or ask a different question.";
    }

    const answer = data.candidates[0].content.parts[0].text;
    if (
      answer.toLowerCase().includes("having trouble") ||
      answer.toLowerCase().includes("i'm sorry") ||
      answer.toLowerCase().includes("üzgünüm") ||
      answer.toLowerCase().includes("lo siento") ||
      answer.trim() === ""
    ) {
      return currentLanguage === 'tr' 
        ? "Üzgünüm, oyuncu şu anda yanıt vermekte zorlanıyor. Lütfen daha sonra tekrar deneyin veya farklı bir soru sorun."
        : currentLanguage === 'es'
        ? "Lo siento, el actor está teniendo problemas para responder en este momento. Por favor, inténtalo de nuevo más tarde o haz una pregunta diferente."
        : "Sorry, the cast member is having trouble responding right now. Please try again later or ask a different question.";
    }

    return answer;
  } catch (error) {
    console.error('Error chatting with cast:', error);
    const currentLanguage = i18n.language || 'tr';
    return currentLanguage === 'tr' 
      ? "Üzgünüm, oyuncu ile iletişim kurulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      : currentLanguage === 'es'
      ? "Lo siento, hubo un error al contactar con el actor. Por favor, inténtalo de nuevo más tarde."
      : "Sorry, there was an error contacting the cast member. Please try again later.";
  }
}; 