import mongoose from "mongoose";
import Equipo from "../models/equipo.model.js";
import Unidad from "../models/unidad.model.js";

export const crearEquipoConUnidades = async ({
  nombre,
  modelo,
  tipo,
  cantidad,
}) => {
  const equipo = await Equipo.create({ nombre, modelo, tipo });

  const unidades = [];
  const cantidadFinal = cantidad || 1;

  const pref = nombre
    ? String(nombre)
        .split(/\s+/)[0]
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
    : `EQ${String(equipo._id).slice(-4)}`;

  for (let i = 1; i <= cantidadFinal; i++) {
    unidades.push({
      equipo: equipo._id,
      identificador: `${pref}-${i}`,
    });
  }

  const unidadesCreadas = await Unidad.insertMany(unidades);

  return {
    equipo,
    unidadesCreadas, // 👈 IMPORTANTE
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
  const nombreAntiguo = equipo.nombre;

  equipo.nombre = nombre;
  equipo.modelo = modelo;
  equipo.tipo = tipo;

  const equipoGuardado = await equipo.save();

  try {
    // Reindexar unidades en orden de creación usando la primera palabra sanificada en MAYÚSCULAS
    const nuevoPref = equipoGuardado.nombre
      ? String(equipoGuardado.nombre)
          .split(/\s+/)[0]
          .replace(/[^A-Za-z0-9]/g, "")
          .toUpperCase()
      : `EQ${String(equipoGuardado._id).slice(-4)}`;

    const unidadesOrdenadas = await Unidad.find({ equipo: equipo._id }).sort({
      _id: 1,
    });
    for (let i = 0; i < unidadesOrdenadas.length; i++) {
      const unidad = unidadesOrdenadas[i];
      unidad.identificador = `${nuevoPref}-${i + 1}`;
      await unidad.save();
    }
  } catch (err) {
    // si falla actualizar identificadores, loguear y seguir
    console.error("Error actualizando identificadores de unidades:", err);
  }

  return equipoGuardado;
};
