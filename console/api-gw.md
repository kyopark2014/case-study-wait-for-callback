# API Gateway 생성 

1) API Gateway Console에 접속하여 [Create API]를 선택합니다.

https://ap-northeast-2.console.aws.amazon.com/apigateway/main/apis?region=ap-northeast-2

2) [API Gateway 생성](https://github.com/kyopark2014/apigw-rest-querystring/blob/main/create-apigw.md)을 따라서 아래처럼 API Gateway를 생성합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175080942-d74b2cf0-1df6-410f-94d7-81b1f2dfe1a6.png)

- Resource로 "/verification"을 생성하고, GET method를 정의 합니다.

- Method Request에 query string으로 requestId, timestamp, token을 지정합니다. 상세한 방법은 [RESTful API에 Query String 사용하기](https://github.com/kyopark2014/apigw-rest-querystring/blob/main/query-string.md)을 참고합니다. 

- 아래와 같이 GET request에 대한 Lambda function으로 "lambda for verification success"를 지정합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175081931-a8802ed2-dd3f-4f56-949a-ba2a0171f7f8.png)
