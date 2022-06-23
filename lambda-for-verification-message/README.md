# lambda-for-verification-message

SQS에 메시지가 쌓이면 lambda-for-verification-message를 trigger하게 됩니다. 이때, 내려오는 event에는 여러개의 message가 내려올 수 있으므로 아래와 같이 Records를 for 루프를 돌면서 하나씩 처리 합니다. 
