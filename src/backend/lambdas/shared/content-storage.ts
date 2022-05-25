import AWS from "aws-sdk";
import {
  buildArticleAudioKey,
  buildArticleContentKey,
  buildKeyFomUrl,
} from "./keyBuilder";

const s3 = new AWS.S3({ region: process.env.AWS_REGION });
const BucketName = process.env.CONTENT_REPO_BUCKET_NAME!;

const getArticleContent = async (articleUrl: string) => {
  const storageParams = {
    Bucket: BucketName,
    Key: buildArticleContentKey(buildKeyFomUrl(articleUrl)),
  };

  const response = await s3.getObject(storageParams).promise();
  const articleContent = JSON.parse(response.Body!.toString("utf-8"));

  return articleContent;
};

const saveArticleAudio = async (articleUrl: string, audioStream: Buffer) =>
  s3
    .upload({
      ContentType: "audio/mp3",
      Bucket: BucketName,
      Key: buildArticleAudioKey(buildKeyFomUrl(articleUrl)),
      Body: audioStream,
    })
    .promise();

const saveArticleContent = async (articleUrl: string, content: any) => {
  const key = buildKeyFomUrl(articleUrl);

  const storageParams = {
    Bucket: BucketName,
    Key: buildArticleContentKey(key),
    Body: JSON.stringify(content),
  };

  await s3.upload(storageParams).promise();

  return key;
};

const getPubliclyAccessibleAudioUrl = async (articleUrl: string) =>
  getPubliclyAccessibleUrl(buildArticleAudioKey(buildKeyFomUrl(articleUrl)));

const getPublicyAccessibleArticleContent = async (articleUrl: string) =>
  getPubliclyAccessibleUrl(buildArticleContentKey(buildKeyFomUrl(articleUrl)));

const getPubliclyAccessibleUrl = async (key: string) =>
  await s3.getSignedUrlPromise("getObject", {
    Bucket: BucketName,
    Key: buildArticleAudioKey(key),
  });

export {
  getArticleContent,
  saveArticleAudio,
  saveArticleContent,
  getPubliclyAccessibleAudioUrl,
  getPublicyAccessibleArticleContent,
};
