require('dotenv').config();
const { MongoClient } = require('mongodb');

let client;
let db;

const connectToDatabase = async () => {
  if (db) {
    return db;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    client = new MongoClient(mongoUri, {
      useUnifiedTopology: true,
    });
    
    await client.connect();
    db = client.db('coffee-shop');
    
    console.info('Successfully connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

const getOrdersCollection = async () => {
  const database = await connectToDatabase();
  return database.collection('orders');
};

const createOrder = async (orderData) => {
  try {
    const ordersCollection = await getOrdersCollection();
    const order = {
      ...orderData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await ordersCollection.insertOne(order);
    console.info('Order created successfully:', result.insertedId);
    
    return { ...order, _id: result.insertedId };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const ordersCollection = await getOrdersCollection();
    const result = await ordersCollection.updateOne(
      { _id: orderId },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      console.error('Order not found:', orderId);
      throw new Error('Order not found');
    }
    
    console.info('Order status updated:', { orderId, status });
    return result;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

const getOrder = async (orderId) => {
  try {
    const ordersCollection = await getOrdersCollection();
    const order = await ordersCollection.findOne({ _id: orderId });
    
    if (!order) {
      console.error('Order not found:', orderId);
      throw new Error('Order not found');
    }
    
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

const closeConnection = async () => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.info('MongoDB connection closed');
  }
};

module.exports = {
  connectToDatabase,
  createOrder,
  updateOrderStatus,
  getOrder,
  closeConnection
};