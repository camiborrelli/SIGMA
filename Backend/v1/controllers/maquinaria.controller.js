import { registrarMaquinariaServices } from "../services/maquinaria.services.js";

export const registrarMaquinariaController = async (req, res) => {
  try {
    const { nombre, tipo, estado, obraId } = req.body;
    const nuevaMaquinatia = await registrarMaquinariaServices({
      nombre,
      modelo,
      tipo,
      estado,
      stock,
      fechaCompra,
      obraId,
    });
    res.status(201).json(nuevaMaquinatia);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar maquinaria" });
  }
};
