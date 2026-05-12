import mongoose from "mongoose";
import Unidad from "../models/unidad.model.js";

export const getUnidadesPorEquipo = async (equipoId) => {
  return await Unidad.find({ equipo: equipoId }).populate("ubicacion");
};

export const bajaUnidad = async (id) => {
  const unidad = await Unidad.findById(id);
  if (!unidad) throw new Error("Unidad no encontrada");

  unidad.estado = "Dada de Baja";
  await unidad.save();

  return unidad;
};

export const agregarUnidad = async (equipoId) => {
  const count = await Unidad.countDocuments({ equipo: equipoId });

  const nuevaUnidad = await Unidad.create({
    equipo: equipoId,
    identificador: `EQ-${equipoId.toString().slice(-4)}-${count + 1}`,
  });

  return nuevaUnidad;
};

export const enviarAMantenimiento = async (unidadId) => {
  const unidad = await Unidad.findById(unidadId);

  if (!unidad) throw new Error("Unidad no encontrada");

  unidad.estado = "En mantenimiento";
  unidad.cantReparaciones = (unidad.cantReparaciones || 0) + 1;

  await unidad.save();

  return unidad;
};

export const getGarantiaUnidad = async (id) => {
  const unidad = await Unidad.findById(id);

  if (!unidad) throw new Error("Unidad no encontrada");
  if (!unidad.fechaCompra) throw new Error("Fecha no disponible");

  const fechaCompra = new Date(unidad.fechaCompra);
  const fechaFin = new Date(fechaCompra);
  fechaFin.setFullYear(fechaFin.getFullYear() + 1);

  const ahora = new Date();

  return {
    _id: unidad._id,
    nombre: unidad.identificador,
    fechaCompra: unidad.fechaCompra,
    fechaFinGarantia: fechaFin,
    enGarantia: ahora <= fechaFin,
    diasRestantes: Math.max(
      0,
      Math.ceil((fechaFin - ahora) / (1000 * 60 * 60 * 24))
    ),
    estado: unidad.estado,
    cantReparaciones: unidad.cantReparaciones || 0,
  };
};

export const getStatsUnidades = async () => {
  try {
    const result = await Unidad.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          asignadas: { $sum: { $cond: [{ $eq: ["$estado", "Asignada"] }, 1, 0] } },
          mantenimiento: { $sum: { $cond: [{ $eq: ["$estado", "En mantenimiento"] }, 1, 0] } },
          bajas: { $sum: { $cond: [{ $eq: ["$estado", "Dada de Baja"] }, 1, 0] } },
          disponibles: { $sum: { $cond: [{ $eq: ["$estado", "Disponible"] }, 1, 0] } },
        },
      },
    ]);

    return result[0] || {
      total: 0,
      asignadas: 0,
      mantenimiento: 0,
      bajas: 0,
      disponibles: 0,
    };
  } catch (err) {
    throw err;
  }
};

export const getReparacionesUnidad = async (id) => {
  const unidad = await Unidad.findById(id);

  if (!unidad) throw new Error("Unidad no encontrada");

  return {
    cantReparaciones: unidad.cantReparaciones || 0,
  };
};

export const asignarUnidad = async (unidadId, ubicacionId) => {
  const unidad = await Unidad.findById(unidadId);
  if (!unidad) throw new Error("Unidad no encontrada");

  unidad.ubicacion = ubicacionId;
  unidad.estado = "Asignada";

  await unidad.save();
  return unidad;
};
