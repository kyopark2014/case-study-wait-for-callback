# "lambda for task generator"의 생성 

1) Lambda console에서 [Create function]으로 Lambda를 생성합니다. 이때 Function name을 "lambda-for-task-generator"로 입력하고 나머지는 모두 기본값으로 합니다. 

https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions

2) SQS에 task에 대한 정보를 전달하여야 하므로 Lambda의 Policy에 SQS 관련 퍼미션을 추가합니다.

![noname](https://user-images.githubusercontent.com/52392004/175052459-4936b4fa-6900-45af-9921-1b5ae36c2318.png)

```java
        {
            "Effect": "Allow",
            "Action": [
                "sqs:SendMessage",
                "sqs:DeleteMessage"
            ],
            "Resource": "arn:aws:sqs:ap-northeast-2:123456789012:VerificationQueue"
        }
```

3) 소스를 업로드 합니다.

[lambda for task generator의 코드(https://github.com/kyopark2014/case-study-wait-for-callback/tree/main/lambda-for-task-generator)를 lambda로 업로드 합니다. 이때, uuid 생성을 위한 라이브러리가 포함되어야 하므로 zip으로 압축하여 올립니다.

