import { Context } from "aws-lambda";
import {
  getPublicyAccessibleArticleContent,
  saveArticleContent,
} from "../shared/content-storage";
import { postNotificationToConnection } from "../shared/ws-connection-notifier";
import { extractContentFromArticleUrl } from "./extract-content-from-url";

export const handler = async (
  event: { articleUrl: string; connectionId: string },
  context: Context
): Promise<{ articleUrl: string; connectionId: string }> => {
  const { articleUrl, connectionId } = event;

  const articleContent = await extractContentFromArticleUrl(articleUrl);

  if (articleContent) {
    const key = await saveArticleContent(articleUrl, articleContent);
    const articleContentUrl = await getPublicyAccessibleArticleContent(key);

    await postNotificationToConnection(connectionId, {
      type: "contentExtracted",
      articleUrl: articleUrl,
      contentUrl: articleContentUrl,
    });

    return {
      articleUrl,
      connectionId,
    };
  }

  throw new Error(`${articleUrl} was not processed`);
};
