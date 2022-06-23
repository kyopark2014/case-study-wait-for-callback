# lambda-for-task-generator

Step Function이 시작하면 job을 정의 하여야 합니다.

여기서는 requestId와 timestamp를 이용하여 unique한 job id로 사용합니다. 

아래와 같이 requestId와 timestamp를 생성합니다. 

```java
    let requestId = uuidv4(); // generate uuid for request id
    let date = new Date();        
    let timestamp = Math.floor(date.getTime()/1000).toString();
```    
