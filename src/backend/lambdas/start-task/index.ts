import { APIGatewayProxyEvent, Context } from "aws-lambda";
import AWS from "aws-sdk";

var stepfunctions = new AWS.StepFunctions();

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  const {
    requestContext: { connectionId },
    body,
  } = event;

  const { articleUrl } = JSON.parse(body!) as { articleUrl: string };

  console.log(JSON.stringify(body));

  var params = {
    stateMachineArn: process.env.STATE_MACHINE_ARN!,
    input: JSON.stringify({ articleUrl, connectionId }),
  };

  const result = await stepfunctions.startExecution(params).promise();

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Started step function state machine ",
    }),
  };

  return response;
};
