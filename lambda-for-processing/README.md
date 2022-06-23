# Lambda-for-processing

Step function이 wait상태에서 callback을 받아 재실행되면 lambda-for-processing이 실행됩니다. 

이때, event로 아래와 같이 "requestId"와 "timestamp"를 알수 있습니다.


```java
    let requestId = event.Task.requestId;
    let timestamp = event.Task.timestamp;

    console.log('requestId: '+requestId);
    console.log('timestamp: '+timestamp);
```

해당 정보를 가지고 이전 job을 확인하여 필요한 Job을 수행 할 수 있습니다. 

