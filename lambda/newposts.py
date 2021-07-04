import boto3
import os
import uuid

def lambda_handler(event, context):
    
    recordId = str(uuid.uuid4())
    event["id"] = recordId
    event["status"] = "PROCESSING"
    # voice = event["voice"]
    # text = event["text"]
    # speed = event["speed"]
    # timestamp = event["timestamp"]

    print('Generating new DynamoDB record, with ID: ' + recordId)
    print('Input Text: ' + event["text"])
    print('Selected voice: ' + event["voice"])
    
    #Creating new record in DynamoDB table
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['DB_TABLE_NAME'])
    table.put_item(
        Item=event
    )
    
    #Sending notification about new post to SNS
    client = boto3.client('sns')
    client.publish(
        TopicArn = os.environ['SNS_TOPIC'],
        Message = recordId
    )
    
    return recordId
