import Maquinaria from "../models/maquinaria.model.js";

export const registrarMaquinariaServices = async ({
  nombre,
  tipo,
  estado,
  obraId,
}) => {
  const nuevaMaquinatia = new Maquinaria({
    nombre,
    tipo,
    estado,
    obra: obraId,
  });
  await nuevaMaquinatia.save();
  return nuevaMaquinatia;
};
