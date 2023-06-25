import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

samTodoAppDynamoTable = boto3.resource('dynamodb').Table('samTodoApp')

def lambda_handler(event, context):
    logger.info(event)
    
    jsonChange = json.loads(event['body'])
    response = samTodoAppDynamoTable.put_item(
        Item = {
            "timestamp": jsonChange['timestamp'],
            "title": jsonChange['title'],
            "text": jsonChange['text']
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps('post list item for DB'),
        'isBase64Encoded': False,
        'headers': {}
    }
