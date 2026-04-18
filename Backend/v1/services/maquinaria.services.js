import Maquinaria from "../models/maquinaria.model.js";

export const registrarMaquinariaServices = async ({
  nombre,
  tipo,
  modelo,
  estado,
  stock,
  fechaCompra,
  obraId,
}) => {
  const nuevaMaquinaria = new Maquinaria({
    nombre,
    tipo,
    modelo,
    estado,
    stock,
    fechaCompra,
    obraId,
  });
  await nuevaMaquinaria.save();
  return nuevaMaquinaria;
};
