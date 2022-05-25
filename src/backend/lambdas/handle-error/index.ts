import { Context } from "aws-lambda";
import AWS from "aws-sdk";
import { postNotificationToConnection } from "../shared/ws-connection-notifier";

export const handler = async (
  event: {
    error: Error;
    articleUrl: string;
    connectionId: string;
  },
  context: Context
): Promise<{}> => {
  const { error, connectionId, articleUrl } = event;


  await postNotificationToConnection(connectionId, {type: "error", articleUrl, error })

 

  return {
    
  };
};
