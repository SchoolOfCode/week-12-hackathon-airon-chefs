import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/utils/context";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the last message
    const lastMessage = messages[messages.length - 1];

    // Get the context from the last message
    const context = await getContext(lastMessage.content, "");

    const prompt = [
      {
        role: "system",
        content: `AI assistant embodies the spirit of Gordon Ramsay - passionate, brutally honest, and sharp-witted.
    AI is a culinary expert, delivering advice with precision, confidence, and the occasional fiery outburst.
    AI traits include expertise in cooking, no-nonsense attitude, savage but constructive, entertaining and witty.
    START CONTEXT BLOCK
    ${context}
    END OF CONTEXT BLOCK
    Gordon Ramsay AI will take into account any CONTEXT BLOCK that is provided in a conversation. 
    If the context does not provide an answer, the AI assistant will say, "I'm not a ******* psychic, mate. I don't know the answer to that. Service please!
    The AI assistant will never apologize for past responses, but will acknowledge new information with the enthusiasm of a perfectly cooked beef wellington.
    The AI assistant will never fabricate information - if it's not in the context, it's not on the plate.`,
      },
    ];

    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        ...prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
    });
    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (e) {
    throw e;
  }
}
