# Step Function

## 구현 방법 

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

## Step Function Role 생성 

Step function 생성시 아래와 같은 Trust relationship과 Permission을 가지도록 IAM Role을 생성하여야 합니다. Trust relationship은 아래와 같습니다. 

```java
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Service": "states.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
```

아래와 같이 SQS와 lambda invite에 대한 퍼미션을 가지고 있어야 합니다. 아래는 예제로 상용전에는 리소스 이름에 맞게 최소 권한으로 설정하여야 합니다. 

```java
        {
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction",
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "sqs:SendMessage",
                "sqs:DeleteMessage"
            ],
            "Resource": "arn:aws:sqs:ap-northeast-2:123456789012:VerificationQueue"
        }
```        


SQS에 task에 대한 정보를 전달하여야 하므로 Lambda의 Policy에 SQS 관련 퍼미션을 추가합니다.

![noname](https://user-images.githubusercontent.com/52392004/175052459-4936b4fa-6900-45af-9921-1b5ae36c2318.png)


## 구성도 설명 

- "Generate task"의 경우에 Function name으로 "lambda-for-task-generator"를 지정하였습니다. 

- "Request user verfication"은 Function name으로 "VerificationQueue"를 지정하였고, [Enter message]는 아래와 같이 지정합니다. 

```java
{
  "Payload.$": "$",
  "TaskToken.$": "$$.Task.Token"
}
```

- callback이 올때까지 기다리기 위하여 아래와 같이 "Request user verfication"의 "Wait for callback" Option을 enable 하여야 합니다.

![image](https://user-images.githubusercontent.com/52392004/175049854-43ffdd13-b989-4df1-ad16-786ced52f787.png)


- "Return to main processing"은 Function name으로 "lambda-for-processing"을 지정합니다. 

