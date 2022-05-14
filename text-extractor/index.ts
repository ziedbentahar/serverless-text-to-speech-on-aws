import { Readability } from "@mozilla/readability";
import { Context } from "aws-lambda";
import AWS from "aws-sdk";
import { JSDOM } from "jsdom";
import Languages from "languages.io";
import fetch from "node-fetch";

const s3 = new AWS.S3();
const language = new Languages();

export const handler = async (
  event: { articleUrl: string },
  context: Context
): Promise<{ articleKey: string }> => {
  const { articleUrl } = event;

  const response = await fetch(event.articleUrl);
  const body = await response.text();
  const doc = new JSDOM(body, {
    url: articleUrl,
  });
  const article = new Readability(doc.window.document).parse();

  if (article) {
    const recognizedLang = language.recognize(article!.textContent);
    const lang = recognizedLang.ISO639_3;

    const key = `${Buffer.from(articleUrl, "utf-8").toString("base64url")}`;

    const storageParams = {
      Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
      Key: `${key}/content.json`,
      Body: JSON.stringify({
        ...article,
        lang,
      }),
    };

    await s3.upload(storageParams).promise();

    return {
      articleKey: key,
    };
  }

  throw new Error(`${articleUrl} was not processed`);
};
