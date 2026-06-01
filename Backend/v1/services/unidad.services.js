import mongoose from "mongoose";
import Unidad from "../models/unidad.model.js";
import Equipo from "../models/equipo.model.js";
import Obra from "../models/obra.model.js";

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

export const agregarUnidad = async (equipoId, data = {}) => {
  const equipo = await Equipo.findById(equipoId);
  if (!equipo) throw new Error("Equipo no encontrado");

  if (!equipo.codigo) {
    throw new Error("El equipo no tiene código asignado");
  }

  const existentes = await Unidad.countDocuments({ equipo: equipoId });

  const createObj = {
    equipo: equipoId,
    identificador: `${equipo.codigo}-${existentes + 1}`,
  };

  if (data && data.fechaCompra) {
    createObj.fechaCompra = data.fechaCompra;
  }

  const nuevaUnidad = await Unidad.create(createObj);

  return nuevaUnidad;
};

export const enviarAMantenimiento = async (unidadId, usuario = null) => {
  const unidad = await Unidad.findById(unidadId);

  if (!unidad) throw new Error("Unidad no encontrada");

  // No permitir enviar si ya está en mantenimiento o dada de baja
  if (unidad.estado === "En mantenimiento") {
    throw new Error("Unidad ya está en mantenimiento");
  }

  if (unidad.estado === "Dada de Baja") {
    throw new Error("Unidad dada de baja");
  }

  unidad.estado = "En mantenimiento";
  const prev = unidad.cantReparaciones || 0;
  unidad.cantReparaciones = prev + 1;

  console.log(
    `enviarAMantenimiento: unidad=${unidadId} prevCant=${prev} newCant=${unidad.cantReparaciones} usuario=${usuario}`,
  );

  // push historial de mantenimiento
  const entry = {
    fechaInicio: new Date(),
    fechaFin: null,
    usuario: usuario || null,
  };

  if (!Array.isArray(unidad.historialMantenimiento))
    unidad.historialMantenimiento = [];
  unidad.historialMantenimiento.push(entry);

  await unidad.save();

  return unidad;
};

export const getGarantiaUnidad = async (id) => {
  const unidad = await Unidad.findById(id);

  if (!unidad) throw new Error("Unidad no encontrada");

  if (!unidad.fechaCompra) {
    return {
      _id: unidad._id,
      nombre: unidad.identificador,
      fechaCompra: null,
      fechaFinGarantia: null,
      enGarantia: false,
      diasRestantes: 0,
      estado: unidad.estado,
      cantReparaciones: unidad.cantReparaciones || 0,
      historialMantenimiento: unidad.historialMantenimiento || [],
    };
  }

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
      Math.ceil((fechaFin - ahora) / (1000 * 60 * 60 * 24)),
    ),
    estado: unidad.estado,
    cantReparaciones: unidad.cantReparaciones || 0,
    historialMantenimiento: unidad.historialMantenimiento || [],
  };
};

export const getStatsUnidades = async () => {
  try {
    const result = await Unidad.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          asignadas: {
            $sum: { $cond: [{ $eq: ["$estado", "Asignada"] }, 1, 0] },
          },
          mantenimiento: {
            $sum: { $cond: [{ $eq: ["$estado", "En mantenimiento"] }, 1, 0] },
          },
          bajas: {
            $sum: { $cond: [{ $eq: ["$estado", "Dada de Baja"] }, 1, 0] },
          },
          disponibles: {
            $sum: { $cond: [{ $eq: ["$estado", "Disponible"] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      result[0] || {
        total: 0,
        asignadas: 0,
        mantenimiento: 0,
        bajas: 0,
        disponibles: 0,
      }
    );
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

export const agregarUnidadesAEquipo = async ({ equipoId, cantidad }) => {
  const equipo = await Equipo.findById(equipoId);
  if (!equipo) throw new Error("Equipo no encontrado");

  if (!equipo.codigo) {
    throw new Error("El equipo no tiene código asignado");
  }

  const existentes = await Unidad.countDocuments({ equipo: equipoId });

  const unidades = [];

  for (let i = 1; i <= cantidad; i++) {
    const n = existentes + i;

    unidades.push({
      equipo: equipoId,
      identificador: `${equipo.codigo}-${n}`,
    });
  }

  const creadas = await Unidad.insertMany(unidades);
  return creadas;
};

export const eliminarUnidad = async (id) => {
  const unidad = await Unidad.findByIdAndDelete(id);
  if (!unidad) throw new Error("Unidad no encontrada");
  return unidad;
};

export const finalizarMantenimiento = async (id, usuario = null) => {
  const unidad = await Unidad.findById(id);
  if (!unidad) throw new Error("Unidad no encontrada");

  // encontrar la última entrada de historial sin fechaFin
  if (
    Array.isArray(unidad.historialMantenimiento) &&
    unidad.historialMantenimiento.length
  ) {
    for (let i = unidad.historialMantenimiento.length - 1; i >= 0; i--) {
      const h = unidad.historialMantenimiento[i];
      if (!h.fechaFin) {
        h.fechaFin = new Date();
        break;
      }
    }
  }

  unidad.estado = "Disponible";
  await unidad.save();
  return unidad;
};

export const actualizarFechaCompra = async (id, fechaCompra) => {
  const unidad = await Unidad.findById(id);

  if (!unidad) throw new Error("Unidad no encontrada");

  unidad.fechaCompra = fechaCompra;
  await unidad.save();

  return unidad;
};

export const quitarUnidadDeObra = async (idUnidad, idObra) => {
  const unidad = await Unidad.findById(idUnidad);
  if (!unidad) throw new Error("Unidad no encontrada");
  unidad.ubicacion = null;
  unidad.estado = "Disponible";
  await unidad.save();

  // Si el modelo Obra tuviera un array `unidades`, lo actualizamos de forma segura.
  if (idObra) {
    const obra = await Obra.findById(idObra);
    if (obra && Array.isArray(obra.unidades)) {
      obra.unidades = obra.unidades.filter(
        (u) => u.toString() !== idUnidad.toString(),
      );
      await obra.save();
    }
  }

  return unidad;
};
