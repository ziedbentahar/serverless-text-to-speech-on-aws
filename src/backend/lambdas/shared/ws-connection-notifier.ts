import AWS from "aws-sdk";
import ProcessingEvents from "./processing-events";

const apigwManagementApi = new AWS.ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: process.env.NOTIFICATION_ENDPOINT,
});

const postNotificationToConnection = async (
  connectionId: string,
  event: ProcessingEvents
) => {
  await apigwManagementApi
    .postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(event),
    })
    .promise();
};

export { postNotificationToConnection };


