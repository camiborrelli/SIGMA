import {
  registrarObraServices,
  getObraPorIdServices,
  getObrasServices,
} from "../services/obra.services.js";
import mongoose from "mongoose";
import Obra from "../models/obra.model.js";

export const registrarObraController = async (req, res) => {
  try {
    const {
      nombre,
      latitud,
      longitud,
      ubicacion,
      fechaInicio,
      fechaFin,
      estado,
      descripcion,
    } = req.body;
    const nuevaObra = await registrarObraServices({
      nombre,
      latitud,
      longitud,
      ubicacion,
      fechaInicio,
      fechaFin,
      estado,
      descripcion,
    });
    res.status(201).json(nuevaObra);
  } catch (error) {
    if (error.message === "La obra ya existe" || error.code === 11000) {
      return res.status(409).json({ error: "La obra ya existe" });
    }
    // Mongoose validation errors -> return 400 with details
    if (error.name === "ValidationError") {
      const errors = {};
      for (const [key, val] of Object.entries(error.errors || {})) {
        errors[key] = val.message;
      }
      return res.status(400).json({
        error: "Error de validación en los datos de la obra",
        errors,
      });
    }
    if (
      error.message ===
      "Fechas inválidas: fechaFin debe ser posterior a fechaInicio"
    ) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Latitud debe estar entre -90 y 90") {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === "Longitud debe estar entre -180 y 180") {
      return res.status(400).json({ error: error.message });
    }
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

export const eliminarObraController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de obra inválido" });
    }
    const obra = await Obra.findByIdAndDelete(id);
    if (!obra) {
      return res.status(404).json({ error: "Obra no encontrada" });
    }
    res.status(200).json({ message: "Obra eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar obra" });
  }
};
