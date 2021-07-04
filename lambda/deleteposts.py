import boto3
import os
# from boto3.dynamodb.conditions import Key, Attr

def lambda_handler(event, context):

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(os.environ['DB_TABLE_NAME'])
    
    response = table.delete_item(
        Key={
            'id': event['id']
        }
    )
    
    return "Item deleted"
