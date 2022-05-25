import { Context } from "aws-lambda";
import { getArticleContent, saveArticleAudio } from "../shared/content-storage";
import { synthesize } from "./synthesize-text";

export const handler = async (
  event: { articleUrl: string; connectionId: string },
  context: Context
): Promise<{ articleUrl: string; connectionId: string }> => {
  const { articleUrl, connectionId } = event;

  const articleContent = await getArticleContent(articleUrl);

  try {
    const audio = await synthesize(
      articleContent.paragraphs,
      articleContent.iso2Lang
    );
    await saveArticleAudio(articleUrl, audio);
    console.log(`Success, audio file added for ${articleUrl} `);
    return {
      articleUrl,
      connectionId,
    };
  } catch (err) {
    console.log("Error putting object", err);
    throw err;
  }
};
