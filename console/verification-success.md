# Lambda for verification success


1) Lambda console에서 [Create function]으로 Lambda를 생성합니다. 이때 Function name을 "lambda-for-verification-message"로 입력하고 나머지는 모두 기본값으로 합니다. 

https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions

2) SQS와 Step Function에 대한 퍼미션을 "Lambda for verification success"의 Policy에 추가합니다.

![noname](https://user-images.githubusercontent.com/52392004/175167389-968623e2-cc2f-4b25-a93e-28a07bf6b237.png)


```java
        {
            "Effect": "Allow",
            "Action": [
                "states:SendTaskSuccess"
            ],
            "Resource": "arn:aws:states:ap-northeast-2:677146750822:stateMachine:MyStateMachine"
        }
```

3) ["lambda for verification success" git repository](https://github.com/kyopark2014/case-study-wait-for-callback/tree/main/lambda-for-verification-success)에서 index.js의 코드를 복사하여, lambda에 붙여 넣기를 합니다. 


