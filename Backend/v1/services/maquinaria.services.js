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
    obra: obraId,
  });
  await nuevaMaquinaria.save();
  // devolver obra poblada para que el frontend reciba el nombre de la obra
  await nuevaMaquinaria.populate("obra");
  return nuevaMaquinaria;
};

export const getMaquinariasActivasServices = async () => {
  return await Maquinaria.find({ estado: "Disponible" }).populate("obra");
};

export const getMaquinariasServices = async () => {
  return await Maquinaria.find().populate("obra");
};

export const eliminarMaquinariaServices = async (id) => {
  return await Maquinaria.findByIdAndDelete(id);
};
