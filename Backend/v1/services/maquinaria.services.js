import Maquinaria from "../models/maquinaria.model.js";

export const registrarMaquinariaServices = async ({
  nombre,
  tipo,
  estado,
  obraId,
}) => {
  if (!obraId) {
    throw new Error("El ID de la obra es obligatorio");
  }

  const existente = await Maquinaria.findOne({ nombre });
  if (existente) {
    const err = new Error("Ya existe una maquinaria con ese nombre");
    err.code = "DUPLICATE_NAME";
    throw err;
  }
  const nuevaMaquinaria = new Maquinaria({
    nombre,
    tipo,
    estado,
    obra: obraId,
  });
  await nuevaMaquinaria.save();
  return nuevaMaquinaria;
};

export const getMaquinariasActivasServices = async () => {
  return await Maquinaria.find({ estado: "Disponible" });
};

export const eliminarMaquinariaServices = async (id) => {
  const maquinariaEliminada = await Maquinaria.findByIdAndDelete(id);
  if (!maquinariaEliminada) {
    throw new Error("Maquinaria no encontrada");
  }
  return maquinariaEliminada;
};
