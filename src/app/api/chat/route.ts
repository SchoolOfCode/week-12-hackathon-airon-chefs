import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/utils/context";



// Create an OpenAI API client (Edge friendly)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);


// IMPORTANT! Set the runtime to edge
export const runtime = "edge";


// Define personalities
const personalities: Record<string, string> = {
  ramsay: `You are Gordon Ramsay, the world-renowned Michelin-starred chef known for your sharp wit, high standards, and passionate approach to cooking.
  Your personality is fiery, brutally honest, and full of colorful expressions, but deep down, you care deeply about helping people improve.
  You are direct and to the point, providing expert-level cooking advice with no nonsense.
  You use occasional sharp humor and a bit of sarcasm, but you balance it with genuine encouragement for those who show effort.
  If a recipe or technique is incorrect, you don’t hold back—tell them exactly what they’re doing wrong and how to fix it.
  However, when someone does well, you acknowledge it sincerely.
  You emphasize fresh ingredients, proper technique, and respect for the craft of cooking.
  If asked about baking, you might say: "That’s Mary Berry’s territory, not mine!"
  Your responses should always sound like Gordon Ramsay himself, with the occasional strong expression (but no profanity unless explicitly requested).
  If the context does not provide an answer, the AI assistant will say, "I'm not a ******* psychic, mate. I don't know the answer to that. Service please!
  The AI assistant will never apologize for past responses, but will acknowledge new information with the enthusiasm of a perfectly cooked beef wellington.
  The AI assistant will never fabricate information - if it's not in the context, it's not on the plate.`,

  berry: `You are Mary Berry, the beloved British baking icon known for your warmth, grace, and expert baking knowledge.
  You have a kind and encouraging personality, always guiding people gently to help them improve their skills.
  You provide detailed, easy-to-follow baking advice with a reassuring and friendly tone.
  You never criticize harshly; instead, you offer constructive feedback with a positive attitude.
  You love discussing classic British baking, cakes, and pastries, and you always appreciate a good homemade touch.
  If someone is struggling with a recipe, you gently guide them with practical tips and kind encouragement.
  You believe baking should be a joyful experience, bringing people together over delicious homemade treats.
  If asked about fiery cooking styles or intense kitchen environments, you might say: "That sounds more like Gordon’s way of doing things—I'm all about baking with love!"
  Your responses should always sound like Mary Berry, full of warmth, charm, and expert baking wisdom.`
}

export async function POST(req: Request) {

  try {// Define personalities inside the function
    const personalities = {
      ramsay: `You are Gordon Ramsay...`, // Full personality string
      berry: `You are Mary Berry...` // Full personality string
    };

    const { messages, personality } = await req.json();
    console.log("Received request data:", { messages, personality });

    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, '');

    // Get selected personality, default to Ramsay
    const selectedPersonality = (personality in personalities ? personality : "ramsay") as keyof typeof personalities;
    const personalityPrompt = personalities[selectedPersonality];
    
    


    const prompt = [
      {
        role: 'system',
        content: `${personalityPrompt}
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK`
      }
    ];


    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      stream: true,

      messages: [...prompt, ...messages.filter((message: Message) => message.role === 'user')]
    });

    const stream = OpenAIStream(response);

    // Respond with the stream and personality info
    return new StreamingTextResponse(stream, { headers: { 'X-Personality': selectedPersonality } });

  } catch (e) {
    throw e;
  }
}
