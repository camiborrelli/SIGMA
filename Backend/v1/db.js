import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI no definido en .env");
}

export async function connectDB() {
  try {
    console.log('Intentando conectar a MongoDB...');

    mongoose.connection.on('connecting', () => console.log('Mongoose: connecting'));
    mongoose.connection.on('connected', () => console.log('Mongoose: connected'));
    mongoose.connection.on('error', (err) => console.error('Mongoose connection error:', err));
    mongoose.connection.on('disconnected', () => console.log('Mongoose: disconnected'));

    // Mongoose 7 no requiere las opciones useNewUrlParser/useUnifiedTopology
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error("Error al conectar a MongoDB:", err);
    throw err;
  }
}

export default mongoose;
