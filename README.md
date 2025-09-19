# Coffee Shop Order Queue System

A serverless application built with AWS Lambda, MongoDB, and SQS to manage coffee shop orders through a queue system.

## Architecture

- **Create Order Endpoint**: HTTP endpoint that accepts order data, stores it in MongoDB, and adds it to SQS queue
- **Process Order Function**: SQS-triggered Lambda that processes orders through 3 stages:
  1. Grind coffee (30 second delay)
  2. Percolate (60 second delay) 
  3. Done (completed)

## Development Setup

### Option 1: Docker (Recommended for Development)

The Docker setup includes:
- **Application**: Serverless offline running the Lambda functions
- **MongoDB**: Database for order storage
- **LocalStack**: Local AWS services (SQS) for development
- **Mongo Express**: Database admin interface

```bash
# Start all services
npm run docker:up-build

# View logs
npm run docker:logs

# Stop all services
npm run docker:down

# Clean up (remove volumes and images)
npm run docker:clean
```

**Services Available:**
- API: http://localhost:3000
- Mongo Express: http://localhost:8081 (admin/admin)
- MongoDB: localhost:27017
- LocalStack: http://localhost:4566

### Option 2: Local Development

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your MongoDB URI and AWS credentials

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run locally:
   ```bash
   npm run offline
   ```

### Option 3: AWS Deployment

```bash
npm run deploy
```

## API Usage

### Create Order
```bash
POST http://localhost:3000/orders
Content-Type: application/json

{
  "coffee_id": "espresso_001",
  "description": "Double Espresso",
  "value": 4.50,
  "customerName": "John Doe",
  "notes": "Extra hot"
}
```

### Response
```json
{
  "success": true,
  "orderId": "uuid-here",
  "status": "pending",
  "message": "Order created and queued for processing"
}
```

## Order Processing Flow

1. Order created with status: `pending`
2. After 30s → status: `grind coffee`
3. After 60s → status: `percolate`
4. After 60s → status: `done`

## Docker Services

- **app**: Main application (serverless offline)
- **mongodb**: MongoDB database
- **localstack**: Local AWS services (SQS)
- **mongo-express**: Database admin interface

## Available Scripts

- `npm run docker:up` - Start Docker services
- `npm run docker:up-build` - Build and start Docker services
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View application logs
- `npm run docker:clean` - Remove all containers, volumes, and images
- `npm run offline` - Run serverless offline locally
- `npm run deploy` - Deploy to AWS
- `npm run remove` - Remove AWS deployment

## Technologies Used

- AWS Lambda (Serverless functions)
- MongoDB (Database)
- Amazon SQS (Message queue)
- Node.js (Runtime)
- Serverless Framework (Deployment)
- Docker & Docker Compose (Development environment)
- LocalStack (Local AWS services)