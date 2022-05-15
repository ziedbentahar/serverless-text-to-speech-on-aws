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
      articleContent.textContent,
      articleContent.iso2Lang
    );
    await saveAudio(articleKey, audio);
    console.log(`Success, audio file added for ${articleKey} `);
  } catch (err) {
    console.log("Error putting object", err);
  }

  return {
    articleKey,
  };
};

const synthesize = async (text: string, iso2Lang: string) => {
  const splittedText = text.match(/.{1500}/g);

  const langCode = iso2LangToLanguageCode[iso2Lang] || "en-EN";

  const audioBuffers = await Promise.all(
    splittedText!.map((chunk) => {
      return polly
        .synthesizeSpeech({
          OutputFormat: "mp3",
          VoiceId: "Joanna",
          TextType: "text",
          Text: chunk,
          LanguageCode: langCode,
          Engine: "neural",
        })
        .promise()
        .then((data) => data.AudioStream);
    })
  );

  const mergedBuffers = audioBuffers.reduce(
    (total: Buffer, buffer: any) =>
      Buffer.concat([total, buffer], total.length + buffer.length),
    Buffer.alloc(1)
  );

  return mergedBuffers;
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

const iso2LangToLanguageCode: { [iso2Lang: string]: string } = {
  fr: "fr-FR",
  en: "en-US",
  ar: "arb",
  de: "de-DE",
  it: "it-IT",
  es: "es-ES",
};
