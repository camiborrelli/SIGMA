import {
  getUnidadesPorEquipo,
  bajaUnidad,
  agregarUnidad,
  enviarAMantenimiento,
  getGarantiaUnidad,
  getStatsUnidades,
  getReparacionesUnidad,
  asignarUnidad,
} from "../services/unidad.services.js";

export const getUnidadesPorEquipoController = async (req, res) => {
  try {
    const { equipoId } = req.params;

    const unidades = await getUnidadesPorEquipo(equipoId);

    res.status(200).json(unidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener unidades" });
  }
};

export const bajaUnidadController = async (req, res) => {
  try {
    const { id } = req.params;

    const unidad = await bajaUnidad(id);

    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al dar de baja unidad" });
  }
};

export const agregarUnidadController = async (req, res) => {
  try {
    const { equipoId } = req.params;

    const nuevaUnidad = await agregarUnidad(equipoId);

    res.status(201).json(nuevaUnidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar unidad" });
  }
};

export const enviarAMantenimientoController = async (req, res) => {
  try {
    const { id } = req.params;

    const unidad = await enviarAMantenimiento(id);

    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    res
      .status(500)
      .json({ error: "Error al enviar unidad a mantenimiento" });
  }
};

export const getGarantiaUnidadController = async (req, res) => {
  try {
    const { id } = req.params;

    const garantia = await getGarantiaUnidad(id);

    res.status(200).json(garantia);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al obtener garantía" });
  }
};

export const getStatsUnidadesController = async (req, res) => {
  try {
    const data = await getStatsUnidades();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "Error al obtener stats de unidades",
      message: err.message,
      stack: err.stack
    });
  }
};

export const getReparacionesUnidadController = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getReparacionesUnidad(id);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al obtener reparaciones" });
  }
};

export const asignarUnidadController = async (req, res) => {
  try {
    const { id } = req.params;
    const { ubicacion } = req.body;

    if (!ubicacion) return res.status(400).json({ error: "Debe indicar la obra" });

    const unidad = await asignarUnidad(id, ubicacion);
    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al asignar unidad" });
  }
};