import { Context } from "aws-lambda";
import AWS from "aws-sdk";

const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: process.env.NOTIFICATION_ENDPOINT,
});

export const handler = async (
  event: {
    error: Error;
    connectionId: string;
  },
  context: Context
): Promise<{}> => {
  const { error, connectionId } = event;

  await apigwManagementApi
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify({ status: "error", error: JSON.stringify(error) }),
    })
    .promise();

  return {};
};
