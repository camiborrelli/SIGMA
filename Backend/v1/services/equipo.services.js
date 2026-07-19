import mongoose from "mongoose";
import Equipo from "../models/equipo.model.js";
import Unidad from "../models/unidad.model.js";
import Obra from "../models/obra.model.js";

const normalizarCantidad = (cantidad, fallback = 1) => {
  if (cantidad === undefined || cantidad === null || cantidad === "") {
    return fallback;
  }

  const numero = Number(cantidad);
  if (!Number.isFinite(numero) || numero < 1) {
    throw new Error("La cantidad debe ser un numero mayor a 0");
  }

  return Math.trunc(numero);
};

const normalizarModoGestion = (modoGestion) => {
  if (!modoGestion) return "unidad";
  if (["unidad", "lote"].includes(modoGestion)) return modoGestion;
  throw new Error("El modo de gestion debe ser unidad o lote");
};

export const crearEquipoConUnidades = async ({
  nombre,
  modelo,
  tipo,
  cantidad,
  modoGestion,
}) => {
  const cantidadFinal = normalizarCantidad(cantidad);
  const modoGestionFinal = normalizarModoGestion(modoGestion);

  const equipo = await Equipo.create({
    nombre,
    modelo,
    tipo,
    modoGestion: modoGestionFinal,
  });

  const codigo = `EQ-${String(equipo._id).slice(-6).toUpperCase()}`;

  equipo.codigo = codigo;
  await equipo.save();

  const unidades = [];

  if (modoGestionFinal === "lote") {
    unidades.push({
      equipo: equipo._id,
      identificador: `${codigo}-L1`,
      cantidad: cantidadFinal,
    });
  } else {
    const existentes = await Unidad.countDocuments({ equipo: equipo._id });

    for (let i = 1; i <= cantidadFinal; i++) {
      unidades.push({
        equipo: equipo._id,
        identificador: `${codigo}-${existentes + i}`,
        cantidad: 1,
      });
    }
  }

  const unidadesCreadas = await Unidad.insertMany(unidades);

  return {
    equipo,
    unidadesCreadas,
    cantidadGenerada: cantidadFinal,
    registrosGenerados: unidadesCreadas.length,
  };
};

export const getEquiposConStock = async () => {
  const cantidadUnidad = { $ifNull: ["$cantidad", 1] };

  return await Unidad.aggregate([
    {
      $group: {
        _id: "$equipo",

        stockTotal: {
          $sum: {
            $cond: [{ $ne: ["$estado", "Dada de Baja"] }, cantidadUnidad, 0],
          },
        },

        stockDisponible: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Disponible"] }, cantidadUnidad, 0],
          },
        },

        stockAsignado: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Asignada"] }, cantidadUnidad, 0],
          },
        },

        stockMantenimiento: {
          $sum: {
            $cond: [
              { $eq: ["$estado", "En mantenimiento"] },
              cantidadUnidad,
              0,
            ],
          },
        },

        stockBaja: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Dada de Baja"] }, cantidadUnidad, 0],
          },
        },

        registros: { $sum: 1 },
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
        codigo: "$equipo.codigo",
        modoGestion: { $ifNull: ["$equipo.modoGestion", "unidad"] },

        stock: "$stockTotal",
        disponible: "$stockDisponible",
        asignado: "$stockAsignado",
        mantenimiento: "$stockMantenimiento",
        baja: "$stockBaja",
        registros: "$registros",
      },
    },
    { $sort: { nombre: 1, modelo: 1 } },
  ]);
};

export const getStatsEquipos = async () => {
  const total = await Equipo.countDocuments();

  return {
    total,
  };
};

export const editarEquipo = async (id, { nombre, modelo, tipo, modoGestion }) => {
  const equipo = await Equipo.findById(id);
  if (!equipo) throw new Error("Equipo no encontrado");

  equipo.nombre = nombre;
  equipo.modelo = modelo;
  equipo.tipo = tipo;
  if (modoGestion) {
    equipo.modoGestion = normalizarModoGestion(modoGestion);
  }

  const equipoGuardado = await equipo.save();

  return equipoGuardado;
};
