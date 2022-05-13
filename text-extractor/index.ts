import { Readability } from "@mozilla/readability";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const s =
    "https://fr.yahoo.com/news/naufrage-candidate-rn-l%C3%A9gislatives-nest-140520858.html";
  const response = await fetch(s);
  const body = await response.text();
  const doc = new JSDOM(body, {
    url: s,
  });
  const article = new Readability(doc.window.document).parse();
  return {
    statusCode: 200,
    body: JSON.stringify({
      article,
    }),
  };
};
