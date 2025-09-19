const AWS = require('aws-sdk');
const { updateOrderStatus, getOrder } = require('../utils/database');

const sqsConfig = {
  region: process.env.AWS_REGION || 'us-east-1'
};

if (process.env.AWS_ENDPOINT_URL) {
  sqsConfig.endpoint = process.env.AWS_ENDPOINT_URL;
  sqsConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  sqsConfig.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}

const sqs = new AWS.SQS(sqsConfig);

const ORDER_STAGES = {
  PENDING: 'pending',
  GRINDING: 'grind coffee',
  PERCOLATING: 'percolate',
  DONE: 'done'
};

const getNextStage = (currentStatus) => {
  switch (currentStatus) {
    case ORDER_STAGES.PENDING:
      return ORDER_STAGES.GRINDING;
    case ORDER_STAGES.GRINDING:
      return ORDER_STAGES.PERCOLATING;
    case ORDER_STAGES.PERCOLATING:
      return ORDER_STAGES.DONE;
    default:
      return null;
  }
};

const processNextStage = async (orderId) => {
  try {
    const order = await getOrder(orderId);
    const nextStage = getNextStage(order.status);
    
    if (!nextStage) {
      console.info('Order already completed:', orderId);
      return;
    }

    await updateOrderStatus(orderId, nextStage);
    console.info('Order stage updated:', { orderId, stage: nextStage });

    if (nextStage !== ORDER_STAGES.DONE) {
      const delay = nextStage === ORDER_STAGES.GRINDING ? 30 : 60;
      
      const sqsMessage = {
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: JSON.stringify({
          orderId,
          action: 'process_order'
        }),
        DelaySeconds: delay,
        MessageAttributes: {
          orderId: {
            DataType: 'String',
            StringValue: orderId
          }
        }
      };

      await sqs.sendMessage(sqsMessage).promise();
      console.info('Next stage queued:', { orderId, nextStage, delay });
    } else {
      console.info('Order processing completed:', orderId);
    }

  } catch (error) {
    console.error('Error processing order stage:', error);
    throw error;
  }
};

exports.handler = async (event) => {
  try {
    for (const record of event.Records) {
      const messageBody = JSON.parse(record.body);
      const { orderId, action } = messageBody;

      console.info('Processing SQS message:', { orderId, action });

      if (action === 'process_order') {
        await processNextStage(orderId);
      } else {
        console.error('Unknown action:', action);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Orders processed successfully' })
    };

  } catch (error) {
    console.error('Error in SQS handler:', error);
    
    throw error;
  }
};