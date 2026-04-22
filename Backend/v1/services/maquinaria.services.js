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
