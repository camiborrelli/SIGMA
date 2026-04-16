import express from "express";
import { connectDB } from "./v1/db.js";

const app = express();
await connectDB();

app.use(express.json());

app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
