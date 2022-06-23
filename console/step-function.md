# Step Function

## 구현 방법 

1) Step Functions의 Console로 접속하여 [Create state machine]을 선택합니다.

https://ap-northeast-2.console.aws.amazon.com/states/home?region=ap-northeast-2#/statemachines

2) [Design your workflow visually]를 선택하고, [Standard]를 선택한다음 [Next]를 선택합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175047993-9616dc91-ab92-4ce9-9f0e-16a3dfec1594.png)

3) 아래와 같이 "Lambda: Invoke", "SQS: SendMessage", "Lambda: Invoke"을 배치합니다. 

![image](https://user-images.githubusercontent.com/52392004/175048408-123284fc-fd5b-49df-b2c7-b30b2b380e1c.png)


## State 설정 

1) "Lambda: Invoke"에서 "State name"으로 "Generate task"을 입력 후에, Function name으로 "lambda-for-task-generator"의 ARN을 지정하였습니다. 


![noname](https://user-images.githubusercontent.com/52392004/175239445-84494b07-d7d6-4f72-8ccf-f4c4f6715735.png)


2) "SQS: SendMessage"에서 [State name]으로 "Request user verfication"을 입력하고, [Queue URL]을 입력합니다. [Message]는 아래와 같이 지정합니다. 

```java
{
  "Payload.$": "$",
  "TaskToken.$": "$$.Task.Token"
}
```

![noname](https://user-images.githubusercontent.com/52392004/175239841-1bba4dbf-a171-4b3b-aa54-3a2d30cafe35.png)


callback이 올때까지 기다리기 위하여 아래와 같이 "Request user verfication"의 "Wait for callback" Option을 enable 하여야 합니다.

![image](https://user-images.githubusercontent.com/52392004/175049854-43ffdd13-b989-4df1-ad16-786ced52f787.png)


3) "Lambda: Invoke"에서 [State name]으로 "Return to main processing"을 입력하고, Function name으로 "lambda-for-processing"의 ARN을 아래와 같이 지정합니다. [Payload]에는 아래의 값을 입력합니다. 

```java
{
  "Task.$": "$"
}
```

![noname](https://user-images.githubusercontent.com/52392004/175242099-af0ca0f8-6aa1-45b2-976b-d26d37bb28e5.png)


최종으로 생성된 Definition은 아래와 같습니다. 


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
        "FunctionName": "arn:aws:lambda:ap-northeast-2:677146750822:function:lambda-for-task-generator"
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
        "QueueUrl": "https://sqs.ap-northeast-2.amazonaws.com/677146750822/VerificationQueue",
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
        "FunctionName": "arn:aws:lambda:ap-northeast-2:677146750822:function:lambda-for-processing",
        "Payload": {
          "Task.$": "$"
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


