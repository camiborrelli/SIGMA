import Obra from "../models/obra.model.js";

export const registrarObraServices = async ({
  nombre,
  ubicacion,
  fechaInicio,
  fechaFin,
}) => {
  const nuevaObra = new Obra({
    nombre,
    ubicacion,
    fechaInicio,
    fechaFin,
  });
  await nuevaObra.save();
  return nuevaObra;
};

export const getObraPorIdServices = async (id) => {
  return await Obra.findById(id);
};

export const getObrasServices = async () => {
  return await Obra.find();
};
