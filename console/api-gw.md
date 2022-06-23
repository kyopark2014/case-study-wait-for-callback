# API Gateway 생성 

1) API Gateway Console에 접속하여 [Create API]를 선택합니다.

https://ap-northeast-2.console.aws.amazon.com/apigateway/main/apis?region=ap-northeast-2

2) [API Gateway 생성](https://github.com/kyopark2014/apigw-rest-querystring/blob/main/create-apigw.md)을 따라서 아래처럼 API Gateway를 생성합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175080942-d74b2cf0-1df6-410f-94d7-81b1f2dfe1a6.png)

- Resource로 "/verification"을 생성하고, GET method를 정의 합니다.

- Method Request에 query string으로 requestId, timestamp, token을 지정합니다. 상세한 방법은 [RESTful API에 Query String 사용하기](https://github.com/kyopark2014/apigw-rest-querystring/blob/main/query-string.md)을 참고합니다. 

- 아래와 같이 GET request에 대한 Lambda function으로 "lambda for verification success"를 지정합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175081931-a8802ed2-dd3f-4f56-949a-ba2a0171f7f8.png)

3) Mapping Template의 변경

아래와 같이 Mapping Template로 들어갑니다. 

![noname](https://user-images.githubusercontent.com/52392004/175243091-cbce669b-c8ac-4891-bc50-ec6b88f98af9.png)





[Request body passthrough]는 "When there are no templates definded (recommanded)"를 선택하고, [Content-Type]은 "application/json"을 선택합니다. Template으로 아래의 값을 붙여 넣기 하고 [Save]를 선택합니다. 

![noname](https://user-images.githubusercontent.com/52392004/175228033-be9b09f7-fab6-48b9-8a54-2cde2f1d3d6a.png)

requestId, timestamp, token을 quary string으로 받은 경우에 아래와 같이 설정합니다. 

```java
#set($inputRoot = $input.path('$'))
    {
        "requestId": "$input.params('requestId')",
        "timestamp": "$input.params('timestamp')",
        "token": "$input.params('token')"
    }
```

3) API Gateway 설정후에는 아래처럼 deploy를 해줍니다.

![noname](https://user-images.githubusercontent.com/52392004/175082934-b31d82c6-9525-4241-a270-424038784678.png)
