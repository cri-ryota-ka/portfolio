import json
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

samTodoAppDynamoTable = boto3.resource('dynamodb').Table('samTodoApp')

def lambda_handler(event, context):
    logger.info(event)
    
    jsonChange = json.loads(event['body'])
    response = samTodoAppDynamoTable.update_item(
        Key = {
            "timestamp": jsonChange['timestamp']
        },
        ExpressionAttributeNames = {
            "#text": "text"
        },
        UpdateExpression = "set title = :title, #text = :tex",
        ExpressionAttributeValues = {
            ":title": jsonChange['title'],
            ":tex": jsonChange['text']
        }
    )

    return {
        'statusCode': 200,
        'body': json.dumps('update list item for DB'),
        'isBase64Encoded': False,
        'headers': {}
    }
