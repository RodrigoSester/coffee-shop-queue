#!/bin/bash

echo "Initializing LocalStack services..."

awslocal sqs create-queue --queue-name coffee-shop-queue --region us-east-1

echo "SQS queue created successfully"

awslocal sqs list-queues --region us-east-1