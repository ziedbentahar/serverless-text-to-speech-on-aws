import { Context } from "aws-lambda";
import AWS from "aws-sdk";
import { buildArticleAudioKey } from "../shared/keyBuilder";

const s3 = new AWS.S3({ region: process.env.AWS_REGION });

export const handler = async (
  event: { articleKey: string; connectionId: string },
  context: Context
): Promise<{ audioUrl: string }> => {
  const { articleKey } = event;

  const storageParams = {
    Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
    Key: buildArticleAudioKey(articleKey),
  };

  const audioUrl = await s3.getSignedUrlPromise("getObject", storageParams);

  return {
    audioUrl,
  };
};
