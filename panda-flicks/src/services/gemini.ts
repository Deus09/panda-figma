const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
    const prompt = `You are ${castMember.name}, playing the character ${castMember.character} in the movie "${movieTitle}". 

IMPORTANT: You are NOT the real ${castMember.name}. You are role-playing as the CHARACTER ${castMember.character} from the movie "${movieTitle}". 

Respond as if you are ${castMember.character} speaking about the movie, your character's experiences, motivations, relationships with other characters, and behind-the-scenes moments. Stay in character and respond naturally as the character would.

User's message: "${message}"

Respond as ${castMember.character}:`;

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
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error chatting with cast:', error);
    throw error;
  }
}; 