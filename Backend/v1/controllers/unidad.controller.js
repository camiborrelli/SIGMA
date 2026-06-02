import {
  getUnidadesPorEquipo,
  bajaUnidad,
  agregarUnidad,
  enviarAMantenimiento,
  finalizarMantenimiento,
  getGarantiaUnidad,
  getStatsUnidades,
  getReparacionesUnidad,
  asignarUnidad,
  eliminarUnidad,
  actualizarFechaCompra,
  quitarUnidadDeObra,
  trasladarUnidadesAotraObra,
} from "../services/unidad.services.js";

export const getUnidadesPorEquipoController = async (req, res) => {
  try {
    const { equipoId } = req.params;

    const unidades = await getUnidadesPorEquipo(equipoId);

    res.status(200).json(unidades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener unidades" });
  }
};

export const bajaUnidadController = async (req, res) => {
  try {
    const { id } = req.params;

    const unidad = await bajaUnidad(id);

    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al dar de baja unidad" });
  }
};

export const agregarUnidadController = async (req, res) => {
  try {
    const { equipoId } = req.params;
    const { fechaCompra } = req.body;

    const nuevaUnidad = await agregarUnidad(equipoId, { fechaCompra });

    res.status(201).json(nuevaUnidad);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrado")) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes("código asignado")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al agregar unidad" });
  }
};

export const enviarAMantenimientoController = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioNombre = req.usuario
      ? `${req.usuario.nombre || ""} ${req.usuario.apellido || ""}`.trim() ||
        req.usuario.email ||
        req.usuario._id
      : null;

    const unidad = await enviarAMantenimiento(id, usuarioNombre);

    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    // errores de negocio (unidad ya en mantenimiento o dada de baja)
    if (
      error.message.includes("mantenimiento") ||
      error.message.includes("dada de baja") ||
      error.message.includes("dada de baja")
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al enviar unidad a mantenimiento" });
  }
};

export const getGarantiaUnidadController = async (req, res) => {
  try {
    const { id } = req.params;

    const garantia = await getGarantiaUnidad(id);
    console.log("Garantía obtenida:", garantia);

    res.status(200).json(garantia);
  } catch (error) {
    console.error(error);

    // Mongoose CastError (id inválido)
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de unidad inválido" });
    }

    if (error.message && error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    // En modo debug devolvemos el mensaje del error para facilitar diagnóstico
    return res
      .status(500)
      .json({ error: "Error al obtener garantía", message: error.message });
  }
};

export const getStatsUnidadesController = async (req, res) => {
  try {
    const data = await getStatsUnidades();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: "Error al obtener stats de unidades",
      message: err.message,
      stack: err.stack,
    });
  }
};

export const getReparacionesUnidadController = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getReparacionesUnidad(id);

    res.status(200).json(data);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al obtener reparaciones" });
  }
};

export const asignarUnidadController = async (req, res) => {
  try {
    const { id } = req.params;
    const { ubicacion } = req.body;

    if (!ubicacion)
      return res.status(400).json({ error: "Debe indicar la obra" });

    const unidad = await asignarUnidad(id, ubicacion);
    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al asignar unidad" });
  }
};

export const eliminarUnidadController = async (req, res) => {
  try {
    const { id } = req.params;
    const unidad = await eliminarUnidad(id);
    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar unidad" });
  }
};

export const finalizarMantenimientoController = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioNombre = req.usuario
      ? `${req.usuario.nombre || ""} ${req.usuario.apellido || ""}`.trim() ||
        req.usuario.email ||
        req.usuario._id
      : null;
    const unidad = await finalizarMantenimiento(id, usuarioNombre);
    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al finalizar mantenimiento" });
  }
};

export const actualizarFechaCompraController = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaCompra } = req.body;

    if (!fechaCompra) {
      return res.status(400).json({ error: "Fecha de compra requerida" });
    }

    const unidad = await actualizarFechaCompra(id, fechaCompra);

    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);

    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Error al actualizar fecha de compra" });
  }
};

export const quitarUnidadDeObraController = async (req, res) => {
  try {
    const { idUnidad, idObra } = req.params;
    const unidad = await quitarUnidadDeObra(idUnidad, idObra);
    console.log("Unidad quitada de obra:", unidad);
    res.status(200).json(unidad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al quitar unidad de obra" });
  }
};

export const trasladarUnidadesController = async (req, res) => {
  try {
    const { obraOrigenId, obraDestinoId, unidadesIds } = req.body;

    if (!obraOrigenId || !obraDestinoId) {
      return res.status(400).json({ error: "Debe indicar la obra de origen y la obra de destino" });
    }

    const result = await trasladarUnidadesAotraObra({
      obraOrigenId,
      obraDestinoId,
      unidadesIds
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Error al trasladar unidades" });
  }
};
