import {
  registrarObraServices,
  getObraPorIdServices,
  getObrasServices,
} from "../services/obra.services.js";
import mongoose from "mongoose";

export const registrarObraController = async (req, res) => {
  try {
    console.log("POST /obras called with body:", req.body);
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

export const getObraPorIdController = async (req, res) => {
  try {
    const { id } = req.params;
    // validar formato de ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de obra inválido" });
    }
    const obra = await getObraPorIdServices(id);
    if (!obra) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }
    res.status(200).json(obra);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener obra por ID" });
  }
};

export const getObrasController = async (req, res) => {
  try {
    const obras = await getObrasServices();
    res.status(200).json(obras);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener obras" });
  }
};
