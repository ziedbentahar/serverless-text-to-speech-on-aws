import {
  PollyClient,
  StartSpeechSynthesisTaskCommand,
} from "@aws-sdk/client-polly";
import { Context } from "aws-lambda";
import AWS from "aws-sdk";

const pollyClient = new PollyClient({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

export const handler = async (
  event: { articleKey: string },
  context: Context
): Promise<{ articleKey: string }> => {
  const { articleKey } = event;

  const storageParams = {
    Bucket: process.env.CONTENT_REPO_BUCKET_NAME!,
    Key: `${articleKey}/content.json`,
  };

  const response = await s3.getObject(storageParams).promise();
  const articleContent = JSON.parse(response.Body!.toString("utf-8"));

  const params = {
    OutputFormat: "mp3",
    OutputS3BucketName: process.env.CONTENT_REPO_BUCKET_NAME,
    OutputS3KeyPrefix: `${articleKey}/audio.mp3`,
    Text: articleContent.textContent,
    TextType: "text",
    VoiceId: "Joanna",
    SampleRate: "22050",
  };

  try {
    const data = await pollyClient.send(
      new StartSpeechSynthesisTaskCommand(params)
    );
    console.log("Success, audio file added to " + params.OutputS3BucketName);
    console.log(data);
  } catch (err) {
    console.log("Error putting object", err);
  }

  return {
    articleKey,
  };
};
