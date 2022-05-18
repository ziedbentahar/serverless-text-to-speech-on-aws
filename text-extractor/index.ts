import { Readability } from "@mozilla/readability";
import { Context } from "aws-lambda";
import AWS from "aws-sdk";
import { JSDOM } from "jsdom";
import LanguageDetect from "languagedetect";
import fetch from "node-fetch";

const s3 = new AWS.S3();
const languageDetector = new LanguageDetect();
languageDetector.setLanguageType("iso2");

export const handler = async (
  event: { articleUrl: string },
  context: Context
): Promise<{ articleKey: string }> => {
  const { articleUrl } = event;

  const response = await fetch(event.articleUrl);
  let body = await response.text();
  body = addNewLinesBetweenParagaphs(body);

  const doc = new JSDOM(body, {
    url: articleUrl,
  });
  const article = new Readability(doc.window.document).parse();

  if (article) {
    const recognizedLang = languageDetector.detect(article!.textContent, 1);
    const [iso2Lang, _] = recognizedLang[0];

    const key = `${Buffer.from(articleUrl, "utf-8").toString("base64url")}`;

    const storageParams = {
      Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
      Key: `${key}/content.json`,
      Body: JSON.stringify({
        ...article,
        paragraphs: mapTextContentToParagraphArray(article.textContent),
        iso2Lang,
      }),
    };

    await s3.upload(storageParams).promise();

    return {
      articleKey: key,
    };
  }

  throw new Error(`${articleUrl} was not processed`);
};

const addNewLinesBetweenParagaphs = (body: string) =>
  body
    .replace(/<p>/g, "\n<p>")
    .replace(/<p class/g, "\n<p class")
    .replace(/<\/p>/g, "</p>\n");

const mapTextContentToParagraphArray = (textContent: string) =>
  textContent
    .split("\n")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
