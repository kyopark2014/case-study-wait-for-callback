# Case Study: "Wait for Callback" 구현

Step Functions을 이용하여 "Wait for Callback" 패턴을 구현하고자 합니다. 


## 1) Overall Architecture

전체적인 Architecture는 아래와 같습니다. 

<img width="742" alt="image" src="https://user-images.githubusercontent.com/52392004/175043966-6bda055d-8b18-4487-9aa3-02e76b5fa384.png">

1) 여기서는 Step function에 대한 event trigger로서 Event Bridge를 사용합니다. 주기적으로 또는 특정 조건에 의해 Event Trigger로 batch job을 수행하도록 할 수 있습니다. 이때 Step Functions의 "Generate task"는 실행해야할 task에 대한 기본정보를 설정합니다. 그리고 SQS에 관련 정보를 push 하고, SQS에 대한 "Wait for callback" option을 enable하면, sendTaskSuccess 또는 sendTaskFailure가 도착할때까지 workflow가 진행되지 않고 대기하게 됩니다. 

2) SQS에 task 정보가 push되면 "Lambda for verification message"가 trigger가 되는데, 이때 email로 사용자의 확인을 SNS를 통해 요청하게 됩니다.

3) 사용자가 email을 받고, 수신된 이메일을 선택해서 approval하면, 해당 URL이 가리키는 API Gateway로 HTTPS GET request가 RESTful API로 요청됩니다. 

4) 이때, "Lambda for verification success"에 task token이 함께 전달되면, sendTaskSuccess를 이용해 callback으로 Step Function에 결과를 전달하게 됩니다.

5) Step Function은 결과를 받으면 "Return to main processin" 단계로 state가 바뀌고 원래 계획했던 일을 수행할 수 있습니다. 

## 2) Console로 인프라 생성하기 

[Console에서 인프라 생성하기](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/console/README.md)를 따라서 인프라를 생성 할 수 있습니다. 전체 flow를 이해하는데 용이하고, AWS console에 익숙해질수 있는 방법입니다. 

## 3) CDK로 인프라 생성하기 

[CDK로 "Wait-for-Callback"을 Step Function으로 구현하기](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/cdk-callback/README.md)에서는 [AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)를 이용하여 인프라를 생성합니다. 

### 인프라 생성방법

아래와 같이 인프라를 생성합니다. 

1) 코드 다운로드 하기 
```c
$ git clone https://github.com/kyopark2014/case-study-wait-for-callback
$ cd cdk-callback
```

2) ["lib/cdk-callback-stack.ts"](https://github.com/kyopark2014/case-study-wait-for-callback/blob/main/cdk-callback/lib/cdk-callback-stack.ts)에서 아래 부분을 수신받을 email 주소로 변경합니다.

```java
topic.addSubscription(new subscriptions.EmailSubscription('user@gmail.com'));
```

3) 인프라를 설치합니다. 
```c
$ cdk deploy
```

### 인프라 삭제 방법

아래 명령어로 인프라를 한번에 삭제 할 수 있습니다. 

```java
$ cdk destroy
```


## 4) 실행결과

Event Bridge가 구동되면 아래와 같은 Verification message가 전달됩니다.

![noname](https://user-images.githubusercontent.com/52392004/175076020-748e8f6b-da64-410a-a086-9bc81fddb3bd.png)

링크를 선택하면 API Gateway를 통해 verification api가 실행되어, "wait for callback"의 동작이 완료됩니다. 이때 "lambda for processing"이 동작하면서 아래와 같은 로그를 생성합니다. email을 통한 verification 과정 동안에 workflow는 정지 상태가 되고 sendTaskSuccess을 통해 다시 재개가 됨을 알 수 있습니다.

![image](https://user-images.githubusercontent.com/52392004/175076687-bada5f7e-7ee3-4690-a02d-51b0f948e08d.png)

이때의 step function은 아래와 같습니다.

![image](https://user-images.githubusercontent.com/52392004/175077436-ed7387df-852e-4c42-90e3-7f5c356e2da2.png)

Step Function의 Execution history를 보면 아래와 같이 정상적으로 동작함을 알 수 있습니다.

![image](https://user-images.githubusercontent.com/52392004/175083851-0b90e096-b957-4dec-af18-874902e5d117.png)
