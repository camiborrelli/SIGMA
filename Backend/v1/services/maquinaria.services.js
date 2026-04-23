import Maquinaria from "../models/maquinaria.model.js";

export const registrarMaquinariaServices = async ({
  nombre,
  tipo,
  modelo,
  estado,
  stock,
  fechaCompra,
  ubicacion,
}) => {
  const nuevaMaquinaria = new Maquinaria({
    nombre,
    tipo,
    modelo,
    stock,
    fechaCompra,
  });

  // Si no se proporciona una obra (ubicacion), dejar en depósito y estado Disponible
  if (ubicacion == null || ubicacion === "" || ubicacion === undefined) {
    // no obra: dejar ubicacion nula y estado Disponible
    nuevaMaquinaria.ubicacion = null;
    nuevaMaquinaria.estado = "Disponible";
  } else {
    // Si se proporciona una obra, asignar la maquinaria a esa obra
    nuevaMaquinaria.ubicacion = ubicacion;
    nuevaMaquinaria.estado = "Asignada";
  }
  await nuevaMaquinaria.save();
  await nuevaMaquinaria.populate("ubicacion");
  return nuevaMaquinaria;
};

export const getMaquinariasActivasServices = async () => {
  return await Maquinaria.find({ estado: "Disponible" }).populate("ubicacion");
};

export const getMaquinariasServices = async () => {
  return await Maquinaria.find().populate("ubicacion");
};

export const getMaquinariasMantenimientoServices = async () => {
  return await Maquinaria.find({ estado: "En mantenimiento" }).populate("ubicacion");
};

export const getMaquinariasAsignadasServices = async () => {
  return await Maquinaria.find({ estado: "Asignada" }).populate("ubicacion");
};

export const getMaquinariasDadasDeBajaServices = async () => {
  return await Maquinaria.find({ estado: "Dada de Baja" }).populate("ubicacion");
};

export const eliminarMaquinariaServices = async (id) => {
  return await Maquinaria.findByIdAndDelete(id);
};

export const countMaquinariasServices = async (estado) => {
  if (estado) {
    return await Maquinaria.countDocuments({ estado });
  }

  // summary: counts per estado + total
  const agg = await Maquinaria.aggregate([
    {
      $group: {
        _id: "$estado",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {};
  agg.forEach((g) => {
    counts[g._id] = g.count;
  });
  counts.total = await Maquinaria.countDocuments({});
  return counts;
};

export const countMaquinariasByEstado = async (estado) => {
  if (!estado) return 0;
  return await Maquinaria.countDocuments({ estado });
};

export const countMaquinariasSummary = async () => {
  const agg = await Maquinaria.aggregate([
    { $group: { _id: "$estado", count: { $sum: 1 } } },
  ]);
  const counts = {};
  agg.forEach((g) => (counts[g._id] = g.count));
  counts.total = await Maquinaria.countDocuments({});
  return counts;
};
