#!/bin/bash
awslocal s3api create-bucket \
--bucket mybucket \
--create-bucket-configuration LocationConstraint=ap-southeast-1

echo "This is the content of the test.txt file that was retrieved from S3" > test.txt

awslocal s3 cp test.txt s3://mybucket/

awslocal secretsmanager create-secret \
    --name MyTestSecret \
    --description "My test secret created with the CLI." \
    --secret-string "{\"response\":\"some text from secrets managers\"}" \
    --region "ap-southeast-1"
