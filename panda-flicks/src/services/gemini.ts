const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export const improveComment = async (comment: string, movieTitle: string): Promise<string> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a helpful assistant that improves movie reviews. Please improve the following review for the movie "${movieTitle}" while keeping the same meaning and sentiment, but making it more engaging and well-written. The review is: "${comment}"`
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
    const prompt = `You are role-playing as \"${castMember.character}\" from the movie \"${movieTitle}\". Stay in character and answer the user's message as \"${castMember.character}\". If you don't know something, improvise as the character would. User's message: \"${message}\"`;

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
      return "Sorry, the cast member is having trouble responding right now. Please try again later or ask a different question.";
    }

    const answer = data.candidates[0].content.parts[0].text;
    if (
      answer.toLowerCase().includes("having trouble") ||
      answer.toLowerCase().includes("i'm sorry") ||
      answer.trim() === ""
    ) {
      return "Sorry, the cast member is having trouble responding right now. Please try again later or ask a different question.";
    }

    return answer;
  } catch (error) {
    console.error('Error chatting with cast:', error);
    return "Sorry, there was an error contacting the cast member. Please try again later.";
  }
}; 