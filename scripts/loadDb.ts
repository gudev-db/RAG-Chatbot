import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import OpenAI from "openai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

// set up environment variables
const {
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

//websites do scrape

// define which website to scrape
const citrosuco = [
  "https://docs.google.com/document/d/1jhfLliZ3xFPPRVujycHk7mZuGG8ZX_-I97GVEFFviaA/edit?tab=t.0",
  "https://docs.google.com/document/d/1zGu1fNopzGBzf2OU7KFvAvsThtrFNnsWMlRMXkcQx0M/edit?tab=t.0",
  "https://docs.google.com/document/d/1W823sGLeNPAlw44QtmsTej9BYgbCmepQrL83xFokcos/edit?tab=t.0",
  "https://docs.google.com/document/d/19dpqC75jSDmkF6R5NbwecM3Yoj4ebOSiNbJ2zwL9cGE/edit?tab=t.0",
  "https://docs.google.com/document/d/19sVar6ENkkXQ1mI94aUC905gOOcc9PRoos6eq-3L1Mk/edit?tab=t.0",
  "https://docs.google.com/document/d/1o37Nt0DACvqGjflFdz2jy4eVIk6vK02g59xFM822_k0/edit?tab=t.0",
  "https://docs.google.com/document/d/1-sKhHdqsSS53UPI2fNqFQmW85zEltf0V41bZ4VlCBPM/edit?tab=t.0",
  "https://www.citrosuco.com/",
  "https://www.citrosuco.com/products/",
  "https://www.citrosuco.com/a-citrosuco/",
  "https://www.linkedin.com/company/citrosuco/posts/?feedView=all",
  "https://finance.yahoo.com/news/brazil-orange-juice-heavyweight-citrosuco-143515156.html",
  "https://www.citrosuco.com/linha-do-tempo/",
  "https://www.citrosuco.com/commitments/indicators/",
  "https://www.citrosuco.com/sustentabilidade/",
  "https://www.citrosuco.com/cadeia-de-valor/",
  "https://www.citrosuco.com/wp-content/uploads/2024/01/Citrosuco_ra_2021_2022_eng_final.pdf",
  
];

// define which website to scrape
const citrosuco2 = [

  "https://docs.google.com/document/d/1tskVRU6wHZT9MrgwGQYxvOTavE-Bc6kvScsBtkbnAH4/edit?usp=sharing",
  "https://www.holambra.com.br/",
  "https://www.holambra.com.br/servicos/beneficiamento-armazenamento-e-transporte",
  "https://www.holambra.com.br/servicos/creditos-e-investimento",
  "https://www.holambra.com.br/carreiras",
  "https://www.holambra.com.br/governanca/portal-de-privacidade",
  "https://www.holambra.com.br/governanca/organograma-geral",
  "https://www.holambra.com.br/governanca/conselho",
  "https://www.holambra.com.br/produtos/culturas",
  "https://www.holambra.com.br/produtos/racao",
  "https://www.holambra.com.br/produtos/insumos-agricolas",
  "https://www.holambra.com.br/unidades/matriz",
  "https://www.holambra.com.br/unidades/avare",
  "https://www.holambra.com.br/unidades/itabera",
  "https://www.holambra.com.br/unidades/loja-itabera",
  "https://www.holambra.com.br/unidades/loja-itapetininga",
  "https://www.holambra.com.br/unidades/loja-santa-cruz-do-rio-pardo",
  "https://www.holambra.com.br/unidades/sao-manuel",
  "https://www.holambra.com.br/unidades/takaoka",
  "https://www.holambra.com.br/unidades/taquari",
  "https://www.holambra.com.br/unidades/taquarituba",
  "https://www.holambra.com.br/unidades/taquarivai",
  "https://www.holambra.com.br/institucional/quem-somos",
  "https://www.holambra.com.br/institucional/linha-do-tempo",
  "https://www.holambra.com.br/institucional/certificacoes-e-premiacoes",
  "https://www.holambra.com.br/institucional/sustentabilidade-e-responsabilidade-social",
  "https://www.holambra.com.br/institucional/inovacao",
  "https://www.linkedin.com/company/cooperativa-agro-industrial-holambra/",
  "https://cnpj.biz/60906724000120",

  
];

// Comment: Not conforming to TS strictness
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// set splitter + options
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1024,
  chunkOverlap: 180,
});

// create collection on datastrax from datastax API
const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    },
  });

  console.log(res);
};

// load sample data into collection
const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  for await (const url of citrosuco2) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });

      console.log(res);
    }
  }
};

// scrape webpage
const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });
  return ( await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

createCollection().then(() => loadSampleData());