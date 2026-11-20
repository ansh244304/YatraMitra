
import dns from 'node:dns';
import mongoose from 'mongoose';

// Connect to MongoDB
export async function connectDb() {
  try {
    const url = process.env.MONGODB_URL;

    // Check database URL
    if (!url) {
      throw new Error('MONGODB_URL is missing in .env file');
    }

    const dnsServers = process.env.MONGODB_DNS_SERVERS;
    if (dnsServers) {
      dns.setServers(dnsServers.split(',').map((server) => server.trim()).filter(Boolean));
    }

    // Connect to database
    await mongoose.connect(url);

    console.log('MongoDB connected successfully');

  } catch (error) {
    console.log('Database connection failed:', error.message);
    throw error;
  }
}
