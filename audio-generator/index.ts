import { Context } from "aws-lambda";
import AWS from "aws-sdk";

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const polly = new AWS.Polly({
  signatureVersion: "v4",
  region: process.env.AWS_REGION,
});

export const handler = async (
  event: { articleKey: string },
  context: Context
): Promise<{ articleKey: string }> => {
  const { articleKey } = event;

  const storageParams = {
    Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
    Key: `${articleKey}/content.json`,
  };

  const response = await s3.getObject(storageParams).promise();
  const articleContent = JSON.parse(response.Body!.toString("utf-8"));

  try {
    const audio = await synthesize(
      articleContent.paragraphs,
      articleContent.iso2Lang
    );
    await saveAudio(articleKey, audio);
    console.log(`Success, audio file added for ${articleKey} `);
    return {
      articleKey,
    };
  } catch (err) {
    console.log("Error putting object", err);
    throw err;
  }
};

const synthesize = async (paragraphs: string[], iso2Lang: string) => {
  const audioBuffers: any[] = [];
  const langConfig =
    iso2LangToPollyParams[iso2Lang] || iso2LangToPollyParams["en"];

  for (let paragraph of paragraphs) {
    paragraph = `${paragraph} <break strength="x-strong" />`;

    const splittedText = chunkString(paragraph, 1400);

    const paragraphBuffers = await Promise.all(
      splittedText!.map((chunk) => {
        return polly
          .synthesizeSpeech({
            OutputFormat: "mp3",
            TextType: "SSML",
            Text: `<speak>${chunk}</speak>`,
            LanguageCode: langConfig.langCode,
            Engine: langConfig.engine,
            VoiceId: langConfig.voiceId,
          })
          .promise()
          .then((data) => data.AudioStream);
      })
    );

    audioBuffers.push(paragraphBuffers);
  }

  const mergedBuffers = audioBuffers.reduce(
    (total: Buffer, buffer: any) =>
      Buffer.concat([total, buffer], total.length + buffer.length),
    Buffer.alloc(1)
  );
  return mergedBuffers;
};

const chunkString = (paragraph: string, chunkSize: number) => {
  let splitString = [];
  for (let i = 0; i < paragraph.length; i = i + chunkSize) {
    splitString.push(paragraph.slice(i, i + chunkSize));
  }
  return splitString;
};

const saveAudio = async (articleKey: string, audioStream: any) =>
  s3
    .upload({
      ContentType: "audio/mp3",
      Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
      Key: `${articleKey}/audio.mp3`,
      Body: audioStream,
    })
    .promise();

const iso2LangToPollyParams: {
  [iso2Lang: string]: {
    langCode: string;
    voiceId: string;
    engine: "neural" | "standard";
  };
} = {
  fr: {
    engine: "neural",
    voiceId: "Lea",
    langCode: "fr-FR",
  },
  en: {
    engine: "neural",
    voiceId: "Joanna",
    langCode: "en-US",
  },
  ar: {
    engine: "standard",
    voiceId: "Zeina",
    langCode: "arb",
  },
  de: {
    engine: "neural",
    langCode: "de-DE",
    voiceId: "Vicki",
  },
  it: {
    engine: "neural",
    langCode: "it-IT",
    voiceId: "Bianca",
  },
  es: {
    engine: "neural",
    langCode: "es-ES",
    voiceId: "Lucia",
  },
};
