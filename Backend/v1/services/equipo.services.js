import mongoose from "mongoose";
import Equipo from "../models/equipo.model.js";
import Unidad from "../models/unidad.model.js";
import Obra from "../models/obra.model.js";

export const crearEquipoConUnidades = async ({
  nombre,
  modelo,
  tipo,
  cantidad,
}) => {
  const cantidadFinal = cantidad || 1;

  const equipo = await Equipo.create({
    nombre,
    modelo,
    tipo,
  });

  const codigo = `EQ-${String(equipo._id).slice(-6).toUpperCase()}`;

  equipo.codigo = codigo;
  await equipo.save();

  const unidades = [];

  const existentes = await Unidad.countDocuments({ equipo: equipo._id });

  for (let i = 1; i <= cantidadFinal; i++) {
    unidades.push({
      equipo: equipo._id,
      identificador: `${codigo}-${existentes + i}`,
    });
  }

  const unidadesCreadas = await Unidad.insertMany(unidades);

  return {
    equipo,
    unidadesCreadas,
    cantidadGenerada: unidadesCreadas.length,
  };
};

export const getEquiposConStock = async () => {
  return await Unidad.aggregate([
    {
      $group: {
        _id: "$equipo",

        stockTotal: {
          $sum: {
            $cond: [{ $ne: ["$estado", "Dada de Baja"] }, 1, 0],
          },
        },

        stockDisponible: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Disponible"] }, 1, 0],
          },
        },

        stockAsignado: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Asignada"] }, 1, 0],
          },
        },

        stockMantenimiento: {
          $sum: {
            $cond: [{ $eq: ["$estado", "En mantenimiento"] }, 1, 0],
          },
        },

        stockBaja: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Dada de Baja"] }, 1, 0],
          },
        },
      },
    },

    {
      $lookup: {
        from: "equipos",
        localField: "_id",
        foreignField: "_id",
        as: "equipo",
      },
    },

    { $unwind: "$equipo" },

    {
      $project: {
        _id: "$equipo._id",
        nombre: "$equipo.nombre",
        modelo: "$equipo.modelo",
        tipo: "$equipo.tipo",

        stock: "$stockTotal",
        disponible: "$stockDisponible",
        asignado: "$stockAsignado",
        mantenimiento: "$stockMantenimiento",
        baja: "$stockBaja",
      },
    },
  ]);
};

export const getStatsEquipos = async () => {
  const total = await Equipo.countDocuments();

  return {
    total,
  };
};

export const editarEquipo = async (id, { nombre, modelo, tipo }) => {
  const equipo = await Equipo.findById(id);
  if (!equipo) throw new Error("Equipo no encontrado");

  equipo.nombre = nombre;
  equipo.modelo = modelo;
  equipo.tipo = tipo;

  const equipoGuardado = await equipo.save();

  return equipoGuardado;
};

export const trasladarEquiposAotraObra = async (obraId, obraDestinoId) => {
  // validar obras
  const origen = await Obra.findById(obraId);
  if (!origen) throw new Error("Obra origen no encontrada");

  const destino = await Obra.findById(obraDestinoId);
  if (!destino) throw new Error("Obra destino no encontrada");

  // Trasladar todas las unidades que estén en la obra origen hacia la obra destino
  const result = await Unidad.updateMany(
    { ubicacion: obraId },
    { $set: { ubicacion: obraDestinoId } },
  );

  return {
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
  };
};
