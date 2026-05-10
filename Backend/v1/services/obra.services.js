import Obra from "../models/obra.model.js";

export const registrarObraServices = async ({
  nombre,
  ubicacion,
  fechaInicio,
  fechaFin,
  estado,
}) => {
  const existe = await Obra.findOne({ nombre, ubicacion }).collation({
    locale: "en",
    strength: 2,
  });
  if (existe) {
    const err = new Error("La obra ya existe");
    err.code = 11000;
    throw err;
  }

  const nuevaObra = new Obra({
    nombre,
    ubicacion,
    fechaInicio,
    fechaFin,
    estado,
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
