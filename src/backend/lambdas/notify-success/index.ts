import { Context } from "aws-lambda";
import { getPubliclyAccessibleAudioUrl } from "../shared/content-storage";
import { postNotificationToConnection } from "../shared/ws-connection-notifier";

export const handler = async (
  event: {
    articleUrl: string;
    connectionId: string;
  },
  context: Context
): Promise<{ audioUrl: string }> => {
  const { articleUrl, connectionId } = event;

  const audioUrl = await getPubliclyAccessibleAudioUrl(articleUrl);

  await postNotificationToConnection(connectionId, {
    type: "audioGenerated",
    articleUrl,
    audioUrl,
  });

  return {
    audioUrl,
  };
};
