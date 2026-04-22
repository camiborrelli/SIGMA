import {
  registrarMaquinariaServices,
  getMaquinariasActivasServices,
  getMaquinariasServices,
  eliminarMaquinariaServices,
} from "../services/maquinaria.services.js";

export const registrarMaquinariaController = async (req, res) => {
  try {
    const { nombre, tipo, modelo, estado, stock, fechaCompra, obraId } = req.body;
    const nuevaMaquinaria = await registrarMaquinariaServices({
      nombre,
      modelo,
      tipo,
      estado,
      stock,
      fechaCompra,
      obraId,
    });
    res.status(201).json(nuevaMaquinaria);
  } catch (error) {
    if (error.code === "DUPLICATE_NAME") {
      return res.status(409).json({ error: error.message });
    }
    if (error.message && error.message.includes("obra")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al registrar maquinaria" });
  }
};

//LISTADO DE EQUIPOS

export const getMaquinariasActivasController = async (req, res) => {
  try {
    const maquinarias = await getMaquinariasActivasServices();
    res.status(200).json(maquinarias);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener maquinarias activas" });
  }
};

export const getMaquinariasController = async (req, res) => {
  try {
    const maquinarias = await getMaquinariasServices();
    res.status(200).json(maquinarias);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener maquinarias" });
  }
};

export const eliminarMaquinariaController = async (req, res) => {
  try {
    const { id } = req.params;
    const maquinariaEliminada = await eliminarMaquinariaServices(id);
    if (!maquinariaEliminada) {
      return res.status(404).json({ error: "Maquinaria no encontrada" });
    }
    res.status(200).json({ message: "Maquinaria eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar maquinaria" });
  }
};
