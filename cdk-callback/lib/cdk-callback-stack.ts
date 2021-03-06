import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as  sqs from 'aws-cdk-lib/aws-sqs';
import * as  subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import {SqsEventSource} from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as logs from 'aws-cdk-lib/aws-logs';

export class CdkCallbackStack extends Stack {
  public Machine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // API GATEWAY
    const stage = "dev";

    // log group api
    const logGroup = new logs.LogGroup(this, 'AccessLogsFowStepFunction', {
      retention: 90, // Keep logs for 90 days
    });
    logGroup.grantWrite(new iam.ServicePrincipal('apigateway.amazonaws.com')); 

    // api-role
    const apiRole = new iam.Role(this, "api-role-stepfunction", {
      roleName: "ApiRoleStepFunction",
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com")
    });
    apiRole.addToPolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: ['lambda:InvokeFunction']
    }));
    apiRole.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AWSLambdaExecute',
    }); 

    // define api gateway
    const apigw = new apiGateway.RestApi(this, 'ApiStepFunction', {
      description: 'API Gateway for Step Function',
      endpointTypes: [apiGateway.EndpointType.REGIONAL],
      defaultMethodOptions: {
        authorizationType: apiGateway.AuthorizationType.NONE
      },
      deployOptions: {
        stageName: stage,
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true
        }),
      },
    });   

    // define template
    const templateString: string = `#set($inputRoot = $input.path('$'))
    {
        "requestId": "$input.params('requestId')",
        "timestamp": "$input.params('timestamp')",
        "token": "$input.params('token')"
    }`;

    const requestTemplates = { // path through
      'application/json': templateString,
    };
        
    // Lambda for verification success
    const lambdaVerificationSuccess = new lambda.Function(this, "LambdaVerificationSuccess", {
      description: 'make verification success',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-verification-success"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
      }
    }); 

    // define method
    const apiName = "verification";
    const status = apigw.root.addResource(apiName);

    status.addMethod('GET', new apiGateway.LambdaIntegration(lambdaVerificationSuccess, {
      passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,  // options: NEVER
      credentialsRole: apiRole,
      requestTemplates: requestTemplates,
      integrationResponses: [{
        statusCode: '200',
      }], 
      proxy:false, 
    }), {
      requestParameters: {
        'method.request.querystring.deviceid': true,
        'method.request.querystring.startTimestamp': true,
      },
      methodResponses: [   // API Gateway sends to the client that called a method.
        {
          statusCode: '200',
          responseModels: {
            'application/json': apiGateway.Model.EMPTY_MODEL,
          }, 
        }
      ]
    });
    
    new cdk.CfnOutput(this, 'EndpointUrl', {
      value: apigw.url,
      description: 'The endpoint of API Gateway',
    });

    // SQS - queueVerification
    const queue = new sqs.Queue(this, 'VerificationQueue');
    new cdk.CfnOutput(this, 'sqsVerificationUrl', {
      value: queue.queueUrl,
      description: 'The url of the Verification Queue',
    });

    // SNS
    const topic = new sns.Topic(this, 'cdk-sns-callback', {
      topicName: 'cdk-sns-callback',
      fifo: false  // standard
    });
    topic.addSubscription(new subscriptions.EmailSubscription('storytimebot21@gmail.com'));

    new cdk.CfnOutput(this, 'snsTopicArn', {
      value: topic.topicArn,
      description: 'The arn of the SNS topic',
    });

    // Lambda for task generator 
    const lambdaTaskGenerator = new lambda.Function(this, "LambdaTaskGenerator", {
      description: 'generate task info',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-task-generator"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
      }
    }); 
    new cdk.CfnOutput(this, 'LambdaTaskGeneratorARN', {
      value: lambdaTaskGenerator.functionArn,
      description: 'The arn of lambda for task generator',
    });

    // Lambda for verification message
    const lambdaVerificationMessage = new lambda.Function(this, "LambdaVerificationMessage", {
      description: 'make verification message',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-verification-message"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
        apiName: apiName,
        apigwUrl: apigw.url,
        sqsUrl: queue.queueUrl,
        topicArn: topic.topicArn
      }
    }); 
    new cdk.CfnOutput(this, 'LambdaVerificationMessageARN', {
      value: lambdaVerificationMessage.functionArn,
      description: 'The arn of lambda for verification message',
    });
    
    // grant permission to sqs:ReceiveMessage
    queue.grantConsumeMessages(lambdaVerificationMessage);

    // grant permission to publish toward topic
    topic.grantPublish(lambdaVerificationMessage);

    // add event source 
    lambdaVerificationMessage.addEventSource(new SqsEventSource(queue)); 

    // Lambda for processing
    const lambdaProcessing = new lambda.Function(this, "LambdaProcessing", {
      description: 'main processing',
      runtime: lambda.Runtime.NODEJS_14_X, 
      code: lambda.Code.fromAsset("../lambda-for-processing"), 
      handler: "index.handler", 
      timeout: cdk.Duration.seconds(3),
      environment: {
      }
    }); 

    //Lambda invocation for generating task
    const lambdaTaskGeneratorInvocation = new tasks.LambdaInvoke(this, 'Generate task', {
      lambdaFunction: lambdaTaskGenerator,
      outputPath: '$.Payload',
    });

    // task for SQS
    const sqsVerificationTask = new tasks.SqsSendMessage(this, 'Request user varification', {
      queue,
      messageBody: sfn.TaskInput.fromObject({
        "Payload.$": "$",
        TaskToken:  sfn.JsonPath.taskToken
      }),       
      // messageBody: sfn.TaskInput.fromText(sfn.JsonPath.taskToken),
      integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
    });

    // Lambda invocation for processing
    const lambdaProcessingInvocation = new tasks.LambdaInvoke(this, 'Return to main processing', {
      lambdaFunction: lambdaProcessing,
      inputPath: '$',
      outputPath: '$.Payload',
      //payload: sfn.TaskInput.fromJsonPathAt('$.input.FrsAfe3SetupStateMachine.ProvisionRDSInstance')
      payload: sfn.TaskInput.fromObject({
        "Task.$": "$",
      })
    /*  parameters: {
        "data.$": "$",
        "status": "UNKNOWN_CHANNEL"
      } */
    });

    //Create the workflow definition
    const definition = lambdaTaskGeneratorInvocation.next(sqsVerificationTask)
      .next(lambdaProcessingInvocation);

    //Create the statemachine
    this.Machine = new sfn.StateMachine(this, "StateMachine", {
      definition,
      stateMachineName: 'WaitForCallback',
      stateMachineType: sfn.StateMachineType.STANDARD,
      timeout: cdk.Duration.minutes(5),
    }); 
    new cdk.CfnOutput(this, 'StateMachineARN', {
      value: this.Machine.stateMachineArn,
      description: 'The arn of StateMachineARN',
    });
    
    // grant permission to step function
    queue.grantSendMessages(this.Machine);
    lambdaTaskGenerator.grantInvoke(this.Machine);
    lambdaProcessing.grantInvoke(this.Machine);

    // policy for lambda to send report toward step function
    const sendTaskPolicyStatement = new iam.PolicyStatement({
      resources: [this.Machine.stateMachineArn],
      actions: [
        "states:SendTaskFailure",
        "states:SendTaskHeartbeat",
        "states:SendTaskSuccess",
      ],
    });
    lambdaVerificationSuccess.addToRolePolicy(sendTaskPolicyStatement);

    // role for state machine
    const roleStateMachine = new iam.Role(this, 'RoleStateMachine', {  // To-Do check required??
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
    });
    this.Machine.grantTaskResponse(roleStateMachine); 

    // event bridge for batch
    const eventRole = new iam.Role(this, 'EventBridgeRole', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });

    const rule = new events.Rule(this, 'Cron', {
      description: "Schedule for cron job",
      schedule: events.Schedule.expression('rate(10 minutes)'),
    }); 
    rule.addTarget(new targets.SfnStateMachine(this.Machine, {
      input: events.RuleTargetInput.fromObject({}),
      role: eventRole
    }));
  }
}
