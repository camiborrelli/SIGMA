import Unidad from "../models/unidad.model.js";

export const getDistribucionUnidadesPorEstado = async () => {
  return await Unidad.aggregate([
    {
      $group: {
        _id: "$estado",
        cantidad: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        estado: "$_id",
        cantidad: 1,
      },
    },
  ]);
};

export const getMaquinariaPorObra = async () => {
  return await Unidad.aggregate([
    {
      $match: {
        ubicacion: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "obras",
        localField: "ubicacion",
        foreignField: "_id",
        as: "obra",
      },
    },
    {
      $unwind: "$obra",
    },
    {
      $lookup: {
        from: "equipos",
        localField: "equipo",
        foreignField: "_id",
        as: "equipo",
      },
    },
    {
      $unwind: "$equipo",
    },
    {
      $match: {
        "equipo.tipo": "Maquina",
      },
    },
    {
      $group: {
        _id: "$obra.nombre",
        cantidad: { $sum: 1 },
      },
    },
    {
      $sort: {
        cantidad: -1,
      },
    },
    {
      $project: {
        _id: 0,
        obra: "$_id",
        cantidad: 1,
      },
    },
  ]);
};

export const getEquiposMasEnMantenimiento = async () => {
  return await Unidad.aggregate([
    {
      $lookup: {
        from: "equipos",
        localField: "equipo",
        foreignField: "_id",
        as: "equipo",
      },
    },
    {
      $unwind: "$equipo",
    },
    {
      $project: {
        nombre: "$equipo.nombre",
        modelo: "$equipo.modelo",
        cantidadMantenimientos: {
          $size: {
            $ifNull: ["$historialMantenimiento", []],
          },
        },
      },
    },
    {
      $group: {
        _id: {
          nombre: "$nombre",
          modelo: "$modelo",
        },
        cantidad: {
          $sum: "$cantidadMantenimientos",
        },
      },
    },
    {
      $sort: {
        cantidad: -1,
      },
    },
    {
      $project: {
        _id: 0,
        nombre: "$_id.nombre",
        modelo: "$_id.modelo",
        cantidad: 1,
      },
    },
  ]);
};