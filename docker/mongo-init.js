db = db.getSiblingDB('coffee_shop');

db.createCollection('orders');

db.orders.createIndex({ "_id": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": 1 });

print('Database initialized successfully');