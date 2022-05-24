import { Context } from "aws-lambda";
import AWS from "aws-sdk";
import { buildArticleAudioKey } from "../shared/keyBuilder";

const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: process.env.WS_NOTIFICATION_ENDPOINT,
});

export const handler = async (
  event: { articleKey: string; connectionId: string },
  context: Context
): Promise<{ audioUrl: string }> => {
  const { articleKey, connectionId } = event;

  const storageParams = {
    Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
    Key: buildArticleAudioKey(articleKey),
  };

  const audioUrl = await s3.getSignedUrlPromise("getObject", storageParams);

  await apigwManagementApi
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({ status: "success", audioUrl }),
    })
    .promise();

  return {
    audioUrl,
  };
};
