import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

cdkTodoAppDynamoTable = boto3.resource('dynamodb').Table('cdkTodoApp')

def lambda_handler(event, context):
    logger.info(event)
    
    jsonChange = json.loads(event['body'])
    response = cdkTodoAppDynamoTable.delete_item(
        Key = {
            "timestamp": jsonChange['timestamp']
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps('delete list item for DB'),
        'isBase64Encoded': False,
        'headers': {}
    }
