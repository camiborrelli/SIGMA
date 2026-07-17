import {
  getDistribucionUnidadesPorEstado,
  getMaquinariaPorObra,
  getEquiposMasEnMantenimiento,
} from "../services/graficas.services.js";

export const getDistribucionUnidadesPorEstadoController = async (req, res) => {
  try {
    const datos = await getDistribucionUnidadesPorEstado();

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
    const datos = await getMaquinariaPorObra();

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
    const datos = await getEquiposMasEnMantenimiento();

    res.status(200).json(datos);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error al obtener los equipos con más mantenimientos.",
    });
  }
};