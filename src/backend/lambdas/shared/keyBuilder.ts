const buildKeyFomUrl = (articleUrl: string) =>
  `${Buffer.from(articleUrl, "utf-8").toString("base64url")}`;

const buildArticleContentKey = (articleKey: string) =>
  `${articleKey}/content.json`;

const buildArticleAudioKey = (articleKey: string) => `${articleKey}/audio.mp3`;

export { buildKeyFomUrl, buildArticleContentKey, buildArticleAudioKey };
