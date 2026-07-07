export const getAccionesUsuarioController = async (req, res) => {
  try {
    // const { id } = req.params;
    const acciones = await AccionUsuario.find({ usuario: id }).sort({
      fecha: -1,
    }); //ordenados por fecha descendente
    res.json(acciones);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener las acciones del usuario" });
  }
};
