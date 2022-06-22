# Step Function

1) Step Functions의 Console로 접속하여 [Create state machine]을 선택합니다.

https://ap-northeast-2.console.aws.amazon.com/states/home?region=ap-northeast-2#/statemachines

2) [Design your workflow visually]를 선택하고, [Standard]를 선택한다음 [Next]를 선택합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175047993-9616dc91-ab92-4ce9-9f0e-16a3dfec1594.png)

3) 아래와 같이 Actions를 배치합니다. 

![image](https://user-images.githubusercontent.com/52392004/175048408-123284fc-fd5b-49df-b2c7-b30b2b380e1c.png)

이때, 구성한 Definition은 아래와 같습니다. 

```java
{
  "Comment": "A description of my state machine",
  "StartAt": "Generate task",
  "States": {
    "Generate task": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "OutputPath": "$.Payload",
      "Parameters": {
        "FunctionName": "arn:aws:lambda:ap-northeast-2:123456789012:function:lambda-for-task-generator"
      },
      "Retry": [
        {
          "ErrorEquals": [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException"
          ],
          "IntervalSeconds": 2,
          "MaxAttempts": 6,
          "BackoffRate": 2
        }
      ],
      "Next": "Request user varification"
    },
    "Request user varification": {
      "Type": "Task",
      "Resource": "arn:aws:states:::sqs:sendMessage.waitForTaskToken",
      "Parameters": {
        "QueueUrl": "https://sqs.ap-northeast-2.amazonaws.com/123456789012/VerificationQueue",
        "MessageBody": {
          "Payload.$": "$",
          "TaskToken.$": "$$.Task.Token"
        }
      },
      "Next": "Return to main processing"
    },
    "Return to main processing": {
      "Type": "Task",
      "Resource": "arn:aws:states:::lambda:invoke",
      "OutputPath": "$.Payload",
      "Parameters": {
        "FunctionName": "arn:aws:lambda:ap-northeast-2:123456789012:function:lambda-for-processing",
        "Payload": {
          "Payload.$": "$"
        }
      },
      "Retry": [
        {
          "ErrorEquals": [
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException"
          ],
          "IntervalSeconds": 2,
          "MaxAttempts": 6,
          "BackoffRate": 2
        }
      ],
      "End": true
    }
  }
}
```

- "Generate task"의 경우에 Function name으로 "lambda-for-task-generator"를 지정하였습니다. 

- "Request user verfication"은 Function name으로 "VerificationQueue"를 지정하였고, [Enter message]는 아래와 같이 지정합니다. 

```java
{
  "Payload.$": "$",
  "TaskToken.$": "$$.Task.Token"
}
```

callback이 올때까지 기다리기 위하여 아래 Option을 enable 하여야 합니다.

![image](https://user-images.githubusercontent.com/52392004/175049854-43ffdd13-b989-4df1-ad16-786ced52f787.png)


- "Return to main processing"은 Function name으로 "lambda-for-processing"을 지정합니다. 

