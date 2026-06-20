import {
  registrarObraServices,
  getObraPorIdServices,
  getObrasServices,
  getDetalleObraServices,
  finalizarObraServices,
  reactivarObraServices,
  editarObraServices,
  editarObra,
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
    } = req.body;

    const nuevaObra = await registrarObraServices({
      nombre,
      latitud,
      longitud,
      ubicacion,
      fechaInicio,
      fechaFin,
      estado,
    });
    res.status(201).json(nuevaObra);
  } catch (error) {
    if (error.message === "La obra ya existe" || error.code === 11000) {
      return res.status(409).json({ error: "La obra ya existe" });
    }

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

export const getDetalleObraController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "ID inválido",
      });
    }

    const detalle = await getDetalleObraServices(id);

    if (!detalle) {
      return res.status(404).json({
        error: "Obra no encontrada",
      });
    }

    res.status(200).json(detalle);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error al obtener detalle de obra",
    });
  }
};

export const finalizarObraController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de obra inválido" });
    }

    const obraFinalizada = await finalizarObraServices(id);

    res.status(200).json({
      message: "Obra finalizada correctamente y unidades liberadas",
      obra: obraFinalizada,
    });
  } catch (error) {
    console.error("Error en finalizarObraController:", error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al finalizar la obra" });
  }
};

export const reactivarObraController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID de obra inválido" });
    }

    const obraReactivada = await reactivarObraServices(id);

    res.status(200).json({
      message: "Obra reactivada correctamente",
      obra: obraReactivada,
    });
  } catch (error) {
    console.error("Error en reactivarObraController:", error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al reactivar la obra" });
  }
};

export const cambiarNombreObraController = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre || typeof nombre !== "string") {
      return res
        .status(400)
        .json({ error: "Debe proporcionar un nombre válido" });
    }

    const obraActualizada = await editarObraServices(id, nombre);

    res.status(200).json({
      message: "Nombre de obra actualizado correctamente",
      obra: obraActualizada,
    });
  } catch (error) {
    console.error("Error en cambiarNombreObraController:", error);
    res.status(500).json({ error: "Error al actualizar el nombre de la obra" });
  }
};

export const editarObraController = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fechaInicio, fechaFin } = req.body;

    const datosParaActualizar = {};

    if (nombre !== undefined && nombre !== "")
      datosParaActualizar.nombre = nombre;

    if (fechaInicio) {
      let fechaI = new Date(fechaInicio);
      // fechaI.setUTCHours(0, 0, 0, 0); // normalizar a medianoche UTC
      // fechaI.setDate(fechaI.getDate() + 1); // ✔ sumar un día para compensar desfase
      datosParaActualizar.fechaInicio = fechaI;
    }

    if (fechaFin) {
      let fechaF = new Date(fechaFin);
      // fechaF.setUTCHours(0, 0, 0, 0);
      // fechaF.setDate(fechaF.getDate() + 1);
      datosParaActualizar.fechaFin = fechaF;
    }

    const obraActualizada = await editarObra(id, datosParaActualizar);
    res.status(200).json({
      message: "Obra actualizada correctamente",
      obra: obraActualizada,
    });
  } catch (error) {
    console.error("Error en editarObraController:", error);
    res.status(500).json({ error: "Error al actualizar la obra" });
  }
};
