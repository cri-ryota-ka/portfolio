import json
import logging
import boto3
from decimal import Decimal
import operator

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

samTodoAppDynamoTable = boto3.resource('dynamodb').Table('samTodoApp')

def decimal_default_encode(obj):
    if isinstance(obj, Decimal):
        return int(obj)
    raise TypeError

def lambda_handler(event, context):
    logger.info(event)
    
    response = samTodoAppDynamoTable.scan()
    sortGetList = sorted(response['Items'], key = operator.itemgetter('timestamp'))
    
    return {
        'statusCode': 200,
        'body': json.dumps(sortGetList, default = decimal_default_encode),
        'isBase64Encoded': False,
        'headers': {
            'content-type': 'application/json'
        }
    }
