import mongoose from "mongoose";
import Unidad from "../models/unidad.model.js";

const ESTADOS_UNIDAD = [
  "Disponible",
  "Asignada",
  "En mantenimiento",
  "Dada de Baja",
];

const STATS_VACIAS = {
  total: 0,
  disponibles: 0,
  asignadas: 0,
  mantenimiento: 0,
  bajas: 0,
};

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const buildDateRange = ({ fechaDesde, fechaHasta } = {}) => {
  const range = {};

  if (fechaDesde) {
    const desde = new Date(fechaDesde);
    if (!Number.isNaN(desde.getTime())) {
      desde.setHours(0, 0, 0, 0);
      range.$gte = desde;
    }
  }

  if (fechaHasta) {
    const hasta = new Date(fechaHasta);
    if (!Number.isNaN(hasta.getTime())) {
      hasta.setHours(23, 59, 59, 999);
      range.$lte = hasta;
    }
  }

  return Object.keys(range).length ? range : null;
};

const buildUnidadMatch = (filtros = {}, options = {}) => {
  const { incluirFechas = true } = options;
  const match = {};
  const equipoId = toObjectId(filtros.equipoId || filtros.equipo);
  const obraId = toObjectId(filtros.obraId || filtros.obra);

  if (equipoId) match.equipo = equipoId;
  if (obraId) match.ubicacion = obraId;

  const fechaCompra = incluirFechas ? buildDateRange(filtros) : null;
  if (fechaCompra) match.fechaCompra = fechaCompra;

  return match;
};

const addMatchStage = (pipeline, match) => {
  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }
};

const completarEstados = (datos) => {
  const mapaEstados = new Map(
    datos.map((item) => [item.estado, item.cantidad || 0]),
  );

  return ESTADOS_UNIDAD.map((estado) => ({
    estado,
    cantidad: mapaEstados.get(estado) || 0,
  }));
};

export const getResumenGraficas = async (filtros = {}) => {
  const pipeline = [];
  addMatchStage(pipeline, buildUnidadMatch(filtros));

  pipeline.push({
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
  });

  const resultado = await Unidad.aggregate(pipeline);
  const stats = resultado[0] || STATS_VACIAS;

  return {
    total: stats.total || 0,
    disponibles: stats.disponibles || 0,
    asignadas: stats.asignadas || 0,
    mantenimiento: stats.mantenimiento || 0,
    bajas: stats.bajas || 0,
  };
};

export const getDistribucionUnidadesPorEstado = async (filtros = {}) => {
  const pipeline = [];
  addMatchStage(pipeline, buildUnidadMatch(filtros));

  pipeline.push(
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
    {
      $sort: { estado: 1 },
    },
  );

  const datos = await Unidad.aggregate(pipeline);
  return completarEstados(datos);
};

export const getMaquinariaPorObra = async (filtros = {}) => {
  const pipeline = [];
  addMatchStage(pipeline, {
    ...buildUnidadMatch(filtros),
    ubicacion: buildUnidadMatch(filtros).ubicacion || { $ne: null },
  });

  pipeline.push(
    {
      $lookup: {
        from: "equipos",
        localField: "equipo",
        foreignField: "_id",
        as: "equipo",
      },
    },
    { $unwind: "$equipo" },
    {
      $match: {
        "equipo.tipo": "Maquina",
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
    { $unwind: "$obra" },
    {
      $group: {
        _id: {
          id: "$obra._id",
          nombre: "$obra.nombre",
        },
        cantidad: { $sum: 1 },
      },
    },
    { $sort: { cantidad: -1, "_id.nombre": 1 } },
    {
      $project: {
        _id: 0,
        obraId: "$_id.id",
        obra: "$_id.nombre",
        cantidad: 1,
      },
    },
  );

  return await Unidad.aggregate(pipeline);
};

export const getEquiposMasEnMantenimiento = async (filtros = {}) => {
  const pipeline = [];
  addMatchStage(pipeline, buildUnidadMatch(filtros, { incluirFechas: false }));

  pipeline.push({
    $unwind: {
      path: "$historialMantenimiento",
      preserveNullAndEmptyArrays: false,
    },
  });

  const rangoFechas = buildDateRange(filtros);
  if (rangoFechas) {
    pipeline.push({
      $match: {
        "historialMantenimiento.fechaInicio": rangoFechas,
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "equipos",
        localField: "equipo",
        foreignField: "_id",
        as: "equipo",
      },
    },
    { $unwind: "$equipo" },
    {
      $group: {
        _id: "$equipo._id",
        nombre: { $first: "$equipo.nombre" },
        modelo: { $first: "$equipo.modelo" },
        tipo: { $first: "$equipo.tipo" },
        cantidad: { $sum: 1 },
      },
    },
    { $sort: { cantidad: -1, nombre: 1, modelo: 1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        equipoId: "$_id",
        nombre: 1,
        modelo: 1,
        tipo: 1,
        equipo: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$nombre", "Equipo"] },
                " ",
                { $ifNull: ["$modelo", ""] },
              ],
            },
          },
        },
        cantidad: 1,
      },
    },
  );

  return await Unidad.aggregate(pipeline);
};
