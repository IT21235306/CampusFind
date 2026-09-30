const mongoose = require('mongoose');
let connectionPromise;
function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connectionPromise) {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, { dbName: 'campusfind', serverSelectionTimeoutMS: 10000, maxPoolSize: 10 })
      .catch((error) => { connectionPromise = undefined; throw error; });
  }
  return connectionPromise;
}
module.exports = { connectDB };
