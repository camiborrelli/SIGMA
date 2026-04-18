import { registrarObraServices } from "../services/obra.services.js";

export const registrarObraController = async (req, res) => {
  try {
    const { nombre, ubicacion, fechaInicio, fechaFin } = req.body;
    const nuevaObra = await registrarObraServices({
      nombre,
      ubicacion,
      fechaInicio,
      fechaFin,
    });
    res.status(201).json(nuevaObra);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar obra" });
  }
};
