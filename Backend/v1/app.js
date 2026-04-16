const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/maquinaria", require("./v1/routes/maquinaria.routes.js"));

module.exports = app;
