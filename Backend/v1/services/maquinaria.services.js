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

export const getMaquinariasServices = async (filter = {}) => {
  return await Maquinaria.find(filter).populate("ubicacion");
};

export const getMaquinariasMantenimientoServices = async () => {
  return await Maquinaria.find({ estado: "En mantenimiento" }).populate(
    "ubicacion",
  );
};

export const getMaquinariasAsignadasServices = async () => {
  return await Maquinaria.find({ estado: "Asignada" }).populate("ubicacion");
};

export const getMaquinariasDadasDeBajaServices = async () => {
  return await Maquinaria.find({ estado: "Dada de Baja" }).populate(
    "ubicacion",
  );
};

export const eliminarMaquinariaServices = async (id) => {
  return await Maquinaria.findByIdAndDelete(id);
};

export const getMaquinariaByIdService = async (id) => {
  return await Maquinaria.findById(id).populate("ubicacion");
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

export const asignarMaquinariaMantenimientoServices = async (id, obraId) => {
  const maquinaria = await Maquinaria.findById(id);
  if (!maquinaria) {
    throw new Error("Maquinaria no encontrada");
  }
  maquinaria.estado = "En mantenimiento";
  maquinaria.cantReparaciones += 1;
  await maquinaria.save();
  return maquinaria;
};

export const getGarantiaMaquinariaServices = async (id) => {
  const maquinaria = await Maquinaria.findById(id);
  if (!maquinaria) {
    throw new Error("Maquinaria no encontrada");
  }
  if (!maquinaria.fechaCompra) {
    throw new Error("Fecha de compra no disponible");
  }
  const fechaCompra = new Date(maquinaria.fechaCompra);
  const fechaFinGarantia = new Date(fechaCompra);
  fechaFinGarantia.setFullYear(fechaFinGarantia.getFullYear() + 1); // garantía de 1 año
  const ahora = new Date();
  const enGarantia = ahora <= fechaFinGarantia;
  const diasRestantes = Math.ceil(
    (fechaFinGarantia - ahora) / (1000 * 60 * 60 * 24),
  );

  return {
    _id: maquinaria._id,
    maquinariaNombre: maquinaria.nombre,
    fechaCompra: fechaCompra.toISOString(),
    fechaFinGarantia: fechaFinGarantia.toISOString(),
    enGarantia,
    diasRestantes: diasRestantes >= 0 ? diasRestantes : 0,
  };
};

export const getEquiposPorTipoServices = async (tipo) => {
  if (!tipo) return [];
  return await Maquinaria.find({ tipo }).populate("ubicacion");
};
