const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/maquinaria", require("./v1/routes/maquinaria.routes.js"));
app.use("/obra", require("./v1/routes/obra.routes.js"));

app.listen(process.env.PORT || 5001, () => {
  console.log(`Servidor corriendo en puerto ${process.env.PORT || 5001}`);
});

module.exports = app;
