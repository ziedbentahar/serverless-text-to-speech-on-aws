import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import LanguageDetect from "languagedetect";

const languageDetector = new LanguageDetect();
languageDetector.setLanguageType("iso2");

const extractContentFromArticleUrl = async (articleUrl: string) => {
  const response = await fetch(articleUrl);
  let body = await response.text();
  body = addNewLinesBetweenParagaphs(body);

  const doc = new JSDOM(body, {
    url: articleUrl,
  });
  const article = new Readability(doc.window.document).parse();

  if (article) {
    const recognizedLang = languageDetector.detect(article!.textContent, 1);
    const [iso2Lang, _] = recognizedLang[0];

    return {
      ...article,
      paragraphs: mapTextContentToParagraphArray(article.textContent),
      iso2Lang,
    };
  }
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

export {
  extractContentFromArticleUrl,
};
