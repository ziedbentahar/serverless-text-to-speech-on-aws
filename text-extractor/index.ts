import { Readability } from "@mozilla/readability";
import { Context } from "aws-lambda";
import { JSDOM } from "jsdom";
import LanguageDetect from "languagedetect";
import fetch from "node-fetch";

const languageDetection = new LanguageDetect();
languageDetection.setLanguageType("iso3");

export const handler = async (
  event: { articleUrl: string },
  context: Context
): Promise<any> => {
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

    return {
      ...article,
      lang,
    };
  }

  throw new Error(`${articleUrl} was not processed`);
};
