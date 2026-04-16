import express from "express";
import { connectDB } from "./v1/db.js";

const app = express();
await connectDB();

app.use(express.json());

import maquinariaRoutes from "./v1/routes/maquinaria.routes.js";
app.use("/maquinaria", maquinariaRoutes);

app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});
