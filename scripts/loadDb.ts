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


// define which website to scrape
const holambra = [
  "https://docs.google.com/document/d/1jhfLliZ3xFPPRVujycHk7mZuGG8ZX_-I97GVEFFviaA/edit?tab=t.0",
  "https://docs.google.com/document/d/1zGu1fNopzGBzf2OU7KFvAvsThtrFNnsWMlRMXkcQx0M/edit?tab=t.0",
  "https://docs.google.com/document/d/1W823sGLeNPAlw44QtmsTej9BYgbCmepQrL83xFokcos/edit?tab=t.0",
  "https://holambra.s3.sa-east-1.amazonaws.com/download/jornada-esg.pdf",
  "https://holambra.s3.sa-east-1.amazonaws.com/download/relatorio-de-gestao-2024.pdf",
  "https://drive.google.com/file/d/1DG7qnDcnV6fsoyFu6jWjig5R9oq2HJpB/view?usp=sharing",
  "https://docs.google.com/presentation/d/1B1orXFoZv88Or6BywgoijQNd9BpiXhmt/edit?usp=sharing&ouid=111589519243482759530&rtpof=true&sd=true",
  "https://drive.google.com/file/d/1ysanPziMVdiKMmluVXidy5c46pcaRByc/view?usp=sharing",
  "https://drive.google.com/file/d/1HTV4e2T4NvHgj852KSu9LfKaj1-InK2B/view?usp=sharing",
  "https://docs.google.com/presentation/d/196y_sJk9JBHW91rUPG4cCO9t19QnCDdi/edit?usp=sharing&ouid=111589519243482759530&rtpof=true&sd=true",
  "https://docs.google.com/presentation/d/1b8oionDaAufRrv79fayXPPROF34djORO/edit?usp=sharing&ouid=111589519243482759530&rtpof=true&sd=true",
  "https://docs.google.com/presentation/d/19gvsyVy4O9KlUoa5eWbJ4dDoSgw9Jf0i/edit?usp=sharing&ouid=111589519243482759530&rtpof=true&sd=true",
  "https://docs.google.com/presentation/d/10HmJffbBer_QvYqFSi8rnpqkLxHFd-oU/edit?usp=sharing&ouid=111589519243482759530&rtpof=true&sd=true",
  "https://docs.google.com/presentation/d/1c9zaTbVcAV8RxfHuB9MrRPHI1r-j3q6n/edit?usp=sharing&ouid=111589519243482759530&rtpof=true&sd=true",
  "https://www.holambra.com.br/",
  "https://www.holambra.com.br/institucional/quem-somos",
  "https://www.holambra.com.br/institucional/linha-do-tempo",
  "https://www.holambra.com.br/institucional/certificacoes-e-premiacoes",
  "https://www.holambra.com.br/institucional/sustentabilidade-e-responsabilidade-social",
  "https://www.holambra.com.br/institucional/inovacao",
  "https://www.holambra.com.br/unidades/matriz",
  "https://www.holambra.com.br/produtos/culturas",
  "https://www.holambra.com.br/produtos/racao",
  "https://www.holambra.com.br/produtos/insumos-agricolas",
  "https://www.holambra.com.br/servicos/beneficiamento-armazenamento-e-transporte",
  "https://www.holambra.com.br/servicos/creditos-e-investimento",
  "https://app.linhaetica.com.br/etica/holambra",
  "https://holambra.s3.sa-east-1.amazonaws.com/files/codigo-de-etica.pdf",
  "https://www.situacaocadastral.info/cnpj/cooperativa-agro-industrial-holambra-60906724000120",
];

// define which website to scrape
const cocamar = [

  "https://docs.google.com/document/d/1tskVRU6wHZT9MrgwGQYxvOTavE-Bc6kvScsBtkbnAH4/edit?usp=sharing",
  "https://pt.wikipedia.org/wiki/Maring%C3%A1",
  "https://www.viajali.com.br/maringa-pontos-turisticos/",
  "https://gmconline.com.br/",

  "https://www.cocamar.com.br/sobre",
  "https://www.cocamar.com.br/sobre/sustentabilidade",
  "https://www.cocamar.com.br/sobre/instituto-cocamar",
  "https://www.cocamar.com.br/sobre/estrutura-organizacional",
  "https://www.cocamar.com.br/sobre/certificacoes",
  "https://www.cocamar.com.br/onde-atuamos",
  "https://www.cocamar.com.br/negocios/irrigacao",
  "https://www.cocamar.com.br/negocios/graos",
  "https://www.cocamar.com.br/negocios/nutricao-animal",
  "https://www.cocamar.com.br/negocios/sementes-cocamar",
  "https://www.cocamar.com.br/negocios/fertilizantes-viridian/5/viridian",
  "https://www.cocamar.com.br/negocios/produtos-cocamar",
  "https://www.cocamar.com.br/negocios/racoes-para-pets",
  "https://www.cocamar.com.br/negocios/cocamar-maquinas",
  "https://www.cocamar.com.br/negocios/industria-de-fios",
  "https://www.cocamar.com.br/negocios/posto-cocamar",
  "https://www.cocamar.com.br/negocios/energia-solar",
  "https://www.cocamar.com.br/negocios/cocamartransportes",
  "https://www.cocamar.com.br/negocios/madeira-tratada",
  "https://www.cocamar.com.br/negocios/corretora-de-seguros",
  "https://www.cocamar.com.br/negocios/carne",


  "https://www.informecadastral.com.br/cnpj/cocamar-cooperativa-agroindustrial-79114450000165",


  "https://docs.google.com/document/d/1jhfLliZ3xFPPRVujycHk7mZuGG8ZX_-I97GVEFFviaA/edit?tab=t.0",
  "https://docs.google.com/document/d/1zGu1fNopzGBzf2OU7KFvAvsThtrFNnsWMlRMXkcQx0M/edit?tab=t.0",
  "https://docs.google.com/document/d/1W823sGLeNPAlw44QtmsTej9BYgbCmepQrL83xFokcos/edit?tab=t.0",
  "https://docs.google.com/document/d/19dpqC75jSDmkF6R5NbwecM3Yoj4ebOSiNbJ2zwL9cGE/edit?tab=t.0",

  "https://docs.google.com/document/d/19sVar6ENkkXQ1mI94aUC905gOOcc9PRoos6eq-3L1Mk/edit?tab=t.0",
  "https://docs.google.com/document/d/1o37Nt0DACvqGjflFdz2jy4eVIk6vK02g59xFM822_k0/edit?tab=t.0",
  "https://docs.google.com/document/d/1-sKhHdqsSS53UPI2fNqFQmW85zEltf0V41bZ4VlCBPM/edit?tab=t.0",


  
  "https://docs.google.com/document/d/1LhENR1ISC6lmXsERcVva9S6LUovJuIMBFtCsk8OSe-Y/edit?tab=t.0",
  "https://www.cocamar.com.br/sobre/estrutura-organizacional",
  "https://noticias.uol.com.br/ultimas-noticias/agencia-estado/2025/02/07/cocamar-vai-investir-r-750-milhoes-em-nova-esmagadora-em-maringa.htm",
  "https://www.paranacooperativo.coop.br/noticias-ambiental/presidente-do-conselho-de-administracao-da-cocamar-falou-na-rio-agro-2024",

];

const felina = [

  "https://docs.google.com/document/d/1mIPDr9ofqauayRLLDWxNPPFo3qfO2eGlB3qpSlh8f7g/edit?usp=sharing",
  "https://docs.google.com/document/d/1DYC9AmrcMcoELkxRer_uv6luehBNasGMudEyMNrotaE/edit?usp=sharing",
  "https://docs.google.com/document/d/1_THcjghTOW0JJfMYiDRctj6TtBEU4X9FzoPLKI6lCHk/edit?usp=sharing",
  "https://docs.google.com/document/d/1d1yvSDOjgLggpQU3Snfnt0qMH0g_AIp1DF3gfTnAZ2o/edit?usp=sharing",
  "https://docs.google.com/document/d/1SVgvUMsuHGzZJ_CILGQaOOxZKTvnUy-kXBaXLcfYwDw/edit?usp=sharing",
  "https://docs.google.com/document/d/1Qsvi_I4j3q-whQxdygQvtsSxO3Bg73Hm47r4dNF4zcA/edit?usp=sharing",



]

const transcript =["https://docs.google.com/document/d/1LhENR1ISC6lmXsERcVva9S6LUovJuIMBFtCsk8OSe-Y/edit?tab=t.0",]

// Comment: Not conforming to TS strictness
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

// set splitter + options
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1024,
  chunkOverlap: 128,
});

// create collection on datastrax from datastax API
const createCollection = async (
  similarityMetric: SimilarityMetric = "cosine"
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
  for await (const url of felina) {
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
