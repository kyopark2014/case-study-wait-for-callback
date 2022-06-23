# lambda-for-verification-success

Step Function이 wait한 후에 사용자의 verification process가 완료되면, "lambda-for-verfication이 호출됩니다.

이때 url의 requestId, timestamp, taskToken을 통해 verification 대상에 대한 정보를 파악 할 수 있습니다. 

```java
    const requestId = event.requestId;
    const timestamp = event.timestamp;
    const taskToken = event.token;

    console.log("requestid: "+requestId);
    console.log("timestamp: "+timestamp);
    console.log("taskToken: "+taskToken);
    
    const output = {
        requestId: requestId,
        timestamp: timestamp
    };

    const params = {
        output: JSON.stringify(output),
        taskToken: taskToken
    };

    console.log(`Calling Step Functions to complete callback task with params ${JSON.stringify(params)}`);
```    

Step function에서 다시 workflow를 재시작할 수 있도록 success report를 아래와 같이 전송합니다.

```java
    try {
        let response = await stepfunctions.sendTaskSuccess(params).promise();
        console.log("response: %j", response);
    } catch(err) {
        console.log('err:'+err);
    } 
```    
