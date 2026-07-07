import AccionUsuario from "../models/accionUsuario.model.js";

export const getAccionesUsuarioController = async (req, res) => {
  try {
    const acciones = await AccionUsuario.find()
      .populate("usuario", "nombre apellido email rol")
      .sort({ fecha: -1 });

    res.json(acciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las acciones" });
  }
};
