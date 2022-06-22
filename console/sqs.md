# SQS 

1) SQS Console로 접속하여 [Create queue]를 선택합니다. 

https://ap-northeast-2.console.aws.amazon.com/sqs/v2/home?region=ap-northeast-2#/queues

2) [Queue의 Type]은 "Standard로 하고 이름으로 "VerificationQueue"라고 입력합니다. 나머지는 모두 기본값으로 하고 [Next]를 선택합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175055488-610ede9b-962c-487c-a73e-dd440b84e6e1.png)

3) Lambda triggers에서 아래처럼 "lambda for verification message"를 지정합니다.

![noname](https://user-images.githubusercontent.com/52392004/175056148-1481a6cd-f657-4bc2-b0c6-fd636fbcf1ad.png)
