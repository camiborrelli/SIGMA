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

export const getMaquinariasActivasServices = async () => {
  return await Maquinaria.find({ estado: "Disponible" }).populate("obra");
};

export const getMaquinariasServices = async () => {
  return await Maquinaria.find();
};

export const eliminarMaquinariaServices = async (id) => {
  return await Maquinaria.findByIdAndDelete(id);
};
