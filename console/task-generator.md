# "lambda for task generator"의 생성 

1) Lambda console에서 [Create function]으로 Lambda를 생성합니다. 이때 Function name을 "lambda-for-task-generator"로 입력하고 나머지는 모두 기본값으로 합니다. 

https://ap-northeast-2.console.aws.amazon.com/lambda/home?region=ap-northeast-2#/functions

2) SQS에 메시지를 보내는것은 Step Function이 수행하므로 별도로 퍼미션을 추가하지 않아도 됩니다. 

3) 소스를 업로드 합니다.

[lambda for task generator의 코드(https://github.com/kyopark2014/case-study-wait-for-callback/tree/main/lambda-for-task-generator)를 lambda로 업로드 합니다. 이때, uuid 생성을 위한 라이브러리가 포함되어야 하므로 zip으로 압축하여 올립니다.

