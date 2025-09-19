const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const { createOrder } = require('../utils/database');

const sqsConfig = {
  region: process.env.AWS_REGION || 'us-east-1'
};

if (process.env.AWS_ENDPOINT_URL) {
  sqsConfig.endpoint = process.env.AWS_ENDPOINT_URL;
  sqsConfig.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  sqsConfig.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
}

const sqs = new AWS.SQS(sqsConfig);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST'
  };

  try {
    if (!event.body) {
      console.error('Request body is missing');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const orderData = JSON.parse(event.body);
    
    if (!orderData.coffee_id || !orderData.description || !orderData.value) {
      console.error('Missing required fields in order data:', orderData);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: coffee_id, description, value' 
        })
      };
    }

    const orderId = uuidv4();
    const order = {
      _id: orderId,
      coffee_id: orderData.coffee_id,
      description: orderData.description,
      value: orderData.value,
      customerName: orderData.customerName || 'Anonymous',
      notes: orderData.notes || ''
    };

    const createdOrder = await createOrder(order);
    console.info('Order created in database:', createdOrder._id);

    const sqsMessage = {
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: JSON.stringify({
        orderId: createdOrder._id,
        action: 'process_order'
      }),
      MessageAttributes: {
        orderId: {
          DataType: 'String',
          StringValue: createdOrder._id
        }
      }
    };

    await sqs.sendMessage(sqsMessage).promise();
    console.info('Order sent to SQS queue:', createdOrder._id);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        orderId: createdOrder._id,
        status: 'pending',
        message: 'Order created and queued for processing'
      })
    };

  } catch (error) {
    console.error('Error processing order:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process order'
      })
    };
  }
};