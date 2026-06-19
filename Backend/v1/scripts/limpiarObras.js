import mongoose from "mongoose";
import dotenv from "dotenv";
import Obra from "../models/obra.model.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

console.log("Conectado a MongoDB");

const result = await Obra.deleteMany({});

console.log(`Obras eliminadas: ${result.deletedCount}`);

await mongoose.disconnect();
process.exit(0);