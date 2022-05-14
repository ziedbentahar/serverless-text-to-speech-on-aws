import { Readability } from "@mozilla/readability";
import { Context } from "aws-lambda";
import AWS from "aws-sdk";
import { JSDOM } from "jsdom";
import LanguageDetect from "languagedetect";
import fetch from "node-fetch";

const s3 = new AWS.S3();

const languageDetection = new LanguageDetect();
languageDetection.setLanguageType("iso3");

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
    const languageProbabilities = languageDetection.detect(
      article!.textContent,
      1
    );
    const lang = languageProbabilities[0][0];

    const key = `${Buffer.from(articleUrl, "utf-8").toString("base64url")}`;

    const storageParams = {
      Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
      Key: `${key}/content`,
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
