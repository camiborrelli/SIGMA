import {
  getResumenGraficas,
  getDistribucionUnidadesPorEstado,
  getMaquinariaPorObra,
  getEquiposMasEnMantenimiento,
} from "../services/graficas.services.js";

export const getResumenGraficasController = async (req, res) => {
  try {
    const datos = await getResumenGraficas(req.query);

    res.status(200).json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener el resumen de graficas.",
    });
  }
};

export const getDistribucionUnidadesPorEstadoController = async (req, res) => {
  try {
    const datos = await getDistribucionUnidadesPorEstado(req.query);

    res.status(200).json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener la distribución de unidades por estado.",
    });
  }
};

export const getMaquinariaPorObraController = async (req, res) => {
  try {
    const datos = await getMaquinariaPorObra(req.query);

    res.status(200).json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener la maquinaria por obra.",
    });
  }
};

export const getEquiposMasEnMantenimientoController = async (req, res) => {
  try {
    const datos = await getEquiposMasEnMantenimiento(req.query);

    res.status(200).json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los equipos con más mantenimientos.",
    });
  }
};
