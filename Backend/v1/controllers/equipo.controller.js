import {
  crearEquipoConUnidades,
  getEquiposConStock,
  getStatsEquipos,
} from "../services/equipo.services.js";

export const crearEquipoController = async (req, res) => {
  try {
    const { nombre, modelo, tipo, cantidad } = req.body;

    const result = await crearEquipoConUnidades({
      nombre,
      modelo,
      tipo,
      cantidad,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear equipo" });
  }
};

export const getEquiposController = async (req, res) => {
  try {
    const equipos = await getEquiposConStock();

    res.status(200).json(equipos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener equipos" });
  }
};

export const getStatsEquiposController = async (req, res) => {
  try {
    const data = await getStatsEquipos();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener stats de equipos" });
  }
};