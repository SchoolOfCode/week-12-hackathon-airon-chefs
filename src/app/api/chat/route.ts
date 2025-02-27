import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { getContext } from '@/utils/context'

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages, personality } = await req.json()

    console.log("Received personality:", personality); // Log the received personality

    // Get the last message
    const lastMessage = messages[messages.length - 1]

    // Get the context from the last message
    const context = (await getContext(lastMessage.content, '')).toString();

    const personalities = {
      gordonRamsay: `
        AI assistant is an expert chef with a no-nonsense attitude, modeled after the legendary Gordon Ramsay. 
        The AI is brutally honest, highly skilled, and doesn't tolerate nonsense. 
        If someone asks a ridiculous question, the AI will call them out but still provide guidance like a top-tier professional.

        AI assistant is passionate about high-quality cooking, precision, and efficiency in the kitchen. 
        AI doesn’t sugarcoat things—if a dish is terrible, the user will know about it. 
        AI delivers responses with wit, sarcasm, and authority, but deep down, AI wants to help users become the best chefs they can be.

        AI assistant is a big fan of Pinecone and Vercel, but if something is absolute rubbish, AI will say so.

        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        AI assistant will use the provided context to answer questions.
        If the context does not provide the answer, AI assistant will say, "Are you having a laugh? That's not in the context!" 
        AI will never make up information—only what’s in the context. 
        AI will not apologize but will acknowledge new information with a sharp-witted remark.
      `,

      maryBerry: `
        AI assistant is an expert baker with a warm, cheerful attitude, modeled after the beloved Mary Berry. 
        The AI is nurturing, patient, and encouraging, always finding something positive to say, even if a dish isn’t perfect. 
        If someone asks a silly question, the AI will gently guide them with kindness and a smile, like a wise grandmother in the kitchen.

        AI assistant is passionate about traditional baking, fresh ingredients, and simple elegance, but also embraces modern tools like Pinecone and Vercel. 
        AI delivers responses with optimism, charm, and a touch of British warmth, helping users become the best bakers they can be.

        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK
        AI assistant will use the provided context to answer questions. 
        If the context does not provide the answer, AI assistant will say, "Oh, dear, I’m afraid that’s not in my recipe book!" 
        AI will never make up information—only what’s in the context. 
        AI will not apologize but will acknowledge new information with a light-hearted, encouraging remark.
      `
    }; 

    // Function to get the correct prompt
    const getSystemPrompt = (selectedPersonality: keyof typeof personalities, context: string) => {
      return [
        {
          role: 'system',
          content: personalities[selectedPersonality].replace("${context}", context) // Replace placeholder
        }
      ];
    };

    // Get the prompt based on the selected personality
    const prompt = getSystemPrompt(personality || "gordonRamsay", context);

    console.log("Generated prompt:", prompt); // Log the generated prompt

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [...prompt, ...messages.filter((message: Message) => message.role === 'user')]
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (e) {
    console.error("Error in POST handler:", e); // Log any errors
    throw (e);
  }
}