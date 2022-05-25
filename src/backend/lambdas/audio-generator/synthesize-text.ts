import AWS from "aws-sdk";
import { AudioStream } from "aws-sdk/clients/polly";
import { getLangConfigurationOrDefault } from "./language-configuration";

const polly = new AWS.Polly({
    signatureVersion: "v4",
    region: process.env.AWS_REGION,
  });

const synthesize = async (paragraphs: string[], iso2Lang: string) => {
    const audioBuffers: AudioStream[] = [];
    const langConfig = getLangConfigurationOrDefault(iso2Lang);
  
    for (const paragraph of paragraphs) {
      const paragraphWithBreak = `${paragraph} <break strength="x-strong" />`;
  
      const splittedText = chunkString(paragraphWithBreak, 1400);
  
      const paragraphBuffers = await Promise.all(
        splittedText.map((chunk) => {
          return polly
            .synthesizeSpeech({
              OutputFormat: "mp3",
              TextType: "ssml",
              Text: `<speak>${chunk}</speak>`,
              LanguageCode: langConfig.langCode,
              Engine: langConfig.engine,
              VoiceId: langConfig.voiceId,
            })
            .promise()
            .then((data) => data.AudioStream!);
        })
      );
  
      audioBuffers.push(...paragraphBuffers);
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


export {
    synthesize
} 