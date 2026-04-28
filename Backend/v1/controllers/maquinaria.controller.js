import {
  registrarMaquinariaServices,
  getMaquinariasActivasServices,
  getMaquinariasServices,
  eliminarMaquinariaServices,
  countMaquinariasByEstado,
  countMaquinariasSummary,
  getMaquinariasMantenimientoServices,
  getMaquinariasAsignadasServices,
  getMaquinariasDadasDeBajaServices,
  asignarMaquinariaMantenimientoServices,
  getGarantiaMaquinariaServices,
  getMaquinariaByIdService,
} from "../services/maquinaria.services.js";

export const registrarMaquinariaController = async (req, res) => {
  try {
    const { nombre, tipo, modelo, stock, fechaCompra, obraId } = req.body;
    const nuevaMaquinaria = await registrarMaquinariaServices({
      nombre,
      modelo,
      tipo,
      stock,
      fechaCompra,
      ubicacion: obraId,
    });
    res.status(201).json(nuevaMaquinaria);
  } catch (error) {
    console.error("Error registrando maquinaria:", error);
    if (error.code === "DUPLICATE_NAME") {
      return res.status(409).json({ error: error.message });
    }
    if (error.message && error.message.includes("obra")) {
      return res.status(400).json({ error: error.message });
    }
    // Dev: return error message to help debugging
    return res
      .status(500)
      .json({ error: error.message || "Error al registrar maquinaria" });
  }
};

//LISTADO DE EQUIPOS

export const getMaquinariasActivasController = async (req, res) => {
  try {
    const maquinarias = await getMaquinariasActivasServices();
    res.status(200).json(maquinarias);
  } catch (error) {
    console.error("Error en getMaquinariasActivasController:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al obtener maquinarias activas" });
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

export const getMaquinariasMantenimientoController = async (req, res) => {
  try {
    const maquinarias = await getMaquinariasMantenimientoServices();
    res.status(200).json(maquinarias);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener maquinarias en mantenimiento" });
  }
};

export const getMaquinariasAsignadasController = async (req, res) => {
  try {
    const maquinarias = await getMaquinariasAsignadasServices();
    res.status(200).json(maquinarias);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener maquinarias asignadas" });
  }
};

export const getMaquinariasDadasDeBajaController = async (req, res) => {
  try {
    const maquinarias = await getMaquinariasDadasDeBajaServices();
    res.status(200).json(maquinarias);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener maquinarias dadas de baja" });
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

export const countMaquinariasController = async (req, res) => {
  try {
    const estado = req.params?.estado || req.query?.estado;
    if (estado) {
      const count = await countMaquinariasByEstado(estado);
      return res.status(200).json({ estado, count });
    }

    // no estado provided -> return summary counts
    const counts = await countMaquinariasSummary();
    return res.status(200).json(counts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al contar maquinarias" });
  }
};

export const asignarMaquinaAmantenimientoController = async (req, res) => {
  try {
    const { id } = req.params;
    const maquinaria = await asignarMaquinariaMantenimientoServices(id);
    return res.status(200).json(maquinaria);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al asignar maquinaria a mantenimiento" });
  }
};

export const getGarantiaMaquinaController = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(
      `GET /maquinaria/garantia/${id} requested by ${req.user?.id || "unknown"}`,
    );
    const garantia = await getGarantiaMaquinariaServices(id);
    console.log(`Garantia for ${id}:`, garantia);
    return res.status(200).json(garantia);
  } catch (error) {
    console.error("Error in getGarantiaMaquinaController:", error);
    const msg = error.message || "Error al obtener garantía de maquinaria";
    if (msg.includes("no encontrada")) {
      return res.status(404).json({ error: msg });
    }
    if (
      msg.includes("Fecha de compra no disponible") ||
      msg.includes("compra")
    ) {
      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: msg });
  }
};

export const getMaquinariaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const maquinaria = await getMaquinariaByIdService(id);
    if (!maquinaria)
      return res.status(404).json({ error: "Maquinaria no encontrada" });
    return res.status(200).json(maquinaria);
  } catch (error) {
    console.error("Error in getMaquinariaByIdController:", error);
    return res
      .status(500)
      .json({ error: error.message || "Error al obtener maquinaria" });
  }
};
