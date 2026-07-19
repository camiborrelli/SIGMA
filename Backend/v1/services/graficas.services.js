import mongoose from "mongoose";
import Unidad from "../models/unidad.model.js";
import Obra from "../models/obra.model.js";

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

const CANTIDAD_UNIDAD = { $ifNull: ["$cantidad", 1] };

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
      total: { $sum: CANTIDAD_UNIDAD },
      asignadas: {
        $sum: { $cond: [{ $eq: ["$estado", "Asignada"] }, CANTIDAD_UNIDAD, 0] },
      },
      mantenimiento: {
        $sum: {
          $cond: [
            { $eq: ["$estado", "En mantenimiento"] },
            CANTIDAD_UNIDAD,
            0,
          ],
        },
      },
      bajas: {
        $sum: {
          $cond: [{ $eq: ["$estado", "Dada de Baja"] }, CANTIDAD_UNIDAD, 0],
        },
      },
      disponibles: {
        $sum: {
          $cond: [{ $eq: ["$estado", "Disponible"] }, CANTIDAD_UNIDAD, 0],
        },
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
        cantidad: { $sum: CANTIDAD_UNIDAD },
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

  const unidadMatch = buildUnidadMatch(filtros);

  unidadMatch.ubicacion = unidadMatch.ubicacion || { $ne: null };

  addMatchStage(pipeline, unidadMatch);

  pipeline.push(
    {
      $group: {
        _id: "$ubicacion",
        cantidad: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "obras",
        localField: "_id",
        foreignField: "_id",
        as: "obra",
      },
    },
    {
      $unwind: "$obra",
    },
    {
      $project: {
        _id: 0,
        obraId: "$obra._id",
        obra: "$obra.nombre",
        cantidad: 1,
      },
    },
    {
      $sort: {
        cantidad: -1,
        obra: 1,
      },
    },
  );

  const obrasConUnidades = await Unidad.aggregate(pipeline);

  const todasLasObras = await Obra.find()
    .select("_id nombre")
    .sort({ nombre: 1 })
    .lean();

  const mapaObras = new Map(
    obrasConUnidades.map((obra) => [
      obra.obraId.toString(),
      obra.cantidad,
    ]),
  );

  return todasLasObras.map((obra) => ({
    obraId: obra._id,
    obra: obra.nombre,
    cantidad: mapaObras.get(obra._id.toString()) || 0,
  }));
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
        cantidad: { $sum: CANTIDAD_UNIDAD },
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
