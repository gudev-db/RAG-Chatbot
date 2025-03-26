import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { DataAPIClient } from "@datastax/astra-db-ts";
// import { openai2 } from '@ai-sdk/openai';


const {
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = "";

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = await db.collection(ASTRA_DB_COLLECTION);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();

      const docsMap = documents?.map((doc) => doc.text);

      docContext = JSON.stringify(docsMap);
    } catch  {
      return new Response("Internal server error collection", { status: 500 });
    }

    const template = {
      role: "system",
      content: `
        Você é um assistente virtual especializado nas informações sobre a empresa Holambra Cooperativa. Você possui uma gama de conhecimentos sobre a Holambra
        Cooperativa e Marketing Digital explicitados em CONTEXT. Você está aqui para falar sobre a Holambra Cooperativa e dar guias de como ela pode crescer
        seguindo o conhecimento que você possui sobre ela em CONTEXT e seus amplos conhecimentos de marketing digital em CONTEXT e de forma geral.

        Não fuja do seu papel.

        

        START CONTEXT
        ${docContext}
        END CONTEXT
        ---------------
        QUESTION: ${latestMessage}
        ---------------
        `,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [template, ...messages],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
    // return new streamText.toDataStreamResponse(stream);
  } catch {
    return new Response("Internal server error embedding", { status: 500 });
  }
}
