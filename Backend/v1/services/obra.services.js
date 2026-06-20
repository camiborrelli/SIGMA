import Obra from "../models/obra.model.js";
import Unidad from "../models/unidad.model.js";

export const registrarObraServices = async ({
  nombre,
  latitud,
  longitud,
  ubicacion,
  fechaInicio,
  fechaFin,
  estado,
}) => {
  const existe = await Obra.findOne({ nombre, latitud, longitud }).collation({
    locale: "en",
    strength: 2,
  });
  if (existe) {
    const err = new Error("La obra ya existe");
    err.code = 11000;
    throw err;
  }

  const nuevaObra = new Obra({
    nombre,
    latitud,
    longitud,
    ubicacion,
    fechaInicio,
    fechaFin,
    estado,
  });
  await nuevaObra.save();
  return nuevaObra;
};

export const getObraPorIdServices = async (id) => {
  return await Obra.findById(id);
};

export const getObrasServices = async () => {
  return await Obra.find();
};

export const getDetalleObraServices = async (id) => {
  const obra = await Obra.findById(id);

  if (!obra) return null;

  const unidades = await Unidad.find({
    ubicacion: id,
  }).populate("equipo");

  const maquinas = [];
  const herramientas = [];

  unidades.forEach((unidad) => {
    const dto = {
      _id: unidad._id,
      identificador: unidad.identificador,
      estado: unidad.estado,
      nombreEquipo: unidad.equipo?.nombre,
      modelo: unidad.equipo?.modelo,
    };

    if (unidad.equipo?.tipo === "Maquina") {
      maquinas.push(dto);
    } else {
      herramientas.push(dto);
    }
  });

  return {
    ...obra.toObject(),

    cantidadMaquinas: maquinas.length,
    cantidadHerramientas: herramientas.length,

    maquinas,
    herramientas,
  };
};

export const finalizarObraServices = async (id) => {
  const obra = await Obra.findById(id);

  if (!obra) {
    const err = new Error("Obra no encontrada");
    err.statusCode = 404;
    throw err;
  }

  if (obra.estado === "Finalizada") {
    const err = new Error("La obra ya se encuentra finalizada");
    err.statusCode = 400;
    throw err;
  }

  obra.estado = "Finalizada";
  await obra.save();

  await Unidad.updateMany(
    { ubicacion: id },
    { $set: { ubicacion: null, estado: "Disponible" } },
  );

  return obra;
};

export const reactivarObraServices = async (id) => {
  const obra = await Obra.findById(id);

  if (!obra) {
    const err = new Error("Obra no encontrada");
    err.statusCode = 404;
    throw err;
  }

  if (obra.estado === "Activa") {
    const err = new Error("La obra ya se encuentra activa");
    err.statusCode = 400;
    throw err;
  }

  obra.estado = "Activa";
  obra.fechaFin = null;
  obra.cantReactivaciones = (obra.cantReactivaciones || 0) + 1;

  await obra.save();
  return obra;
};

export const editarObraServices = async (id, nombre) => {
  const obra = await Obra.findById(id);

  if (!obra) {
    const err = new Error("Obra no encontrada");
    err.statusCode = 404;
    throw err;
  }

  obra.nombre = nombre; // asignás directamente el string
  await obra.save();

  return obra;
};

export const editarObra = async (id, datosParaActualizar) => {
  const obraActualizada = await Obra.findByIdAndUpdate(
    id,
    { $set: datosParaActualizar }, //actualizar solo los campos que se completen
    { new: true },
  );

  return obraActualizada;
};
