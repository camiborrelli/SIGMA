import mongoose from "mongoose";
import Unidad from "../models/unidad.model.js";
import Equipo from "../models/equipo.model.js";
import Obra from "../models/obra.model.js";

const normalizarCantidad = (cantidad, fallback = 1) => {
  if (cantidad === undefined || cantidad === null || cantidad === "") {
    return fallback;
  }

  const numero = Number(cantidad);
  if (!Number.isFinite(numero) || numero < 1) {
    throw new Error("La cantidad debe ser un numero mayor a 0");
  }

  return Math.trunc(numero);
};

const getCantidadUnidad = (unidad) => normalizarCantidad(unidad?.cantidad, 1);

const getEquipoId = (equipo) =>
  equipo && typeof equipo === "object" ? equipo._id : equipo;

const generarIdentificadorUnidad = async (equipo, esLote = false) => {
  const equipoId = getEquipoId(equipo);
  const codigo =
    equipo?.codigo || `EQ-${String(equipoId).slice(-6).toUpperCase()}`;
  let siguiente = (await Unidad.countDocuments({ equipo: equipoId })) + 1;
  let identificador = `${codigo}-${esLote ? `L${siguiente}` : siguiente}`;

  while (await Unidad.exists({ equipo: equipoId, identificador })) {
    siguiente += 1;
    identificador = `${codigo}-${esLote ? `L${siguiente}` : siguiente}`;
  }

  return identificador;
};

export const getUnidadesPorEquipo = async (equipoId) => {
  return await Unidad.find({ equipo: equipoId })
    .populate("ubicacion")
    .populate("equipo");
};

export const bajaUnidad = async (id) => {
  const unidad = await Unidad.findById(id);
  if (!unidad) throw new Error("Unidad no encontrada");

  unidad.estado = "Dada de Baja";
  await unidad.save();

  return unidad;
};

export const agregarUnidad = async (equipoId, data = {}) => {
  const equipo = await Equipo.findById(equipoId);
  if (!equipo) throw new Error("Equipo no encontrado");

  if (!equipo.codigo) {
    throw new Error("El equipo no tiene código asignado");
  }

  const esLote = equipo.modoGestion === "lote";
  const cantidad = esLote ? normalizarCantidad(data.cantidad, 1) : 1;

  const createObj = {
    equipo: equipoId,
    identificador: await generarIdentificadorUnidad(equipo, esLote),
    cantidad,
  };

  if (data && data.fechaCompra) {
    createObj.fechaCompra = data.fechaCompra;
  }

  const nuevaUnidad = await Unidad.create(createObj);

  return nuevaUnidad;
};

export const enviarAMantenimiento = async (unidadId, usuario = null, fotoUrl = null, destino = null) => {
  const unidad = await Unidad.findById(unidadId);

  if (!unidad) throw new Error("Unidad no encontrada");

  // No permitir enviar si ya está en mantenimiento o dada de baja
  if (unidad.estado === "En mantenimiento") {
    throw new Error("Unidad ya está en mantenimiento");
  }

  if (unidad.estado === "Dada de Baja") {
    throw new Error("Unidad dada de baja");
  }

  unidad.estado = "En mantenimiento";
  const prev = unidad.cantReparaciones || 0;
  unidad.cantReparaciones = prev + 1;

  const entry = {
    fechaInicio: new Date(),
    fechaFin: null,
    usuario: usuario || null,
    foto: fotoUrl || null,
    destino: destino || null,
  };

  if (!Array.isArray(unidad.historialMantenimiento)) {
    unidad.historialMantenimiento = [];
  }
  
  unidad.historialMantenimiento.push(entry);

  await unidad.save();

  return unidad;
};

export const getGarantiaUnidad = async (id) => {
  const unidad = await Unidad.findById(id);

  if (!unidad) throw new Error("Unidad no encontrada");

  if (!unidad.fechaCompra) {
    return {
      _id: unidad._id,
      nombre: unidad.identificador,
      fechaCompra: null,
      fechaFinGarantia: null,
      enGarantia: false,
      diasRestantes: 0,
      estado: unidad.estado,
      cantidad: getCantidadUnidad(unidad),
      cantReparaciones: unidad.cantReparaciones || 0,
      historialMantenimiento: unidad.historialMantenimiento || [],
    };
  }

  const fechaCompra = new Date(unidad.fechaCompra);
  const fechaFin = new Date(fechaCompra);
  fechaFin.setFullYear(fechaFin.getFullYear() + 1);

  const ahora = new Date();

  return {
    _id: unidad._id,
    nombre: unidad.identificador,
    fechaCompra: unidad.fechaCompra,
    fechaFinGarantia: fechaFin,
    enGarantia: ahora <= fechaFin,
    diasRestantes: Math.max(
      0,
      Math.ceil((fechaFin - ahora) / (1000 * 60 * 60 * 24)),
    ),
    estado: unidad.estado,
    cantidad: getCantidadUnidad(unidad),
    cantReparaciones: unidad.cantReparaciones || 0,
    historialMantenimiento: unidad.historialMantenimiento || [],
  };
};

export const getStatsUnidades = async () => {
  try {
    const cantidadUnidad = { $ifNull: ["$cantidad", 1] };

    const result = await Unidad.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: cantidadUnidad },
          asignadas: {
            $sum: {
              $cond: [{ $eq: ["$estado", "Asignada"] }, cantidadUnidad, 0],
            },
          },
          mantenimiento: {
            $sum: {
              $cond: [
                { $eq: ["$estado", "En mantenimiento"] },
                cantidadUnidad,
                0,
              ],
            },
          },
          bajas: {
            $sum: {
              $cond: [{ $eq: ["$estado", "Dada de Baja"] }, cantidadUnidad, 0],
            },
          },
          disponibles: {
            $sum: {
              $cond: [{ $eq: ["$estado", "Disponible"] }, cantidadUnidad, 0],
            },
          },
        },
      },
    ]);

    return (
      result[0] || {
        total: 0,
        asignadas: 0,
        mantenimiento: 0,
        bajas: 0,
        disponibles: 0,
      }
    );
  } catch (err) {
    throw err;
  }
};

export const getReparacionesUnidad = async (id) => {
  const unidad = await Unidad.findById(id);

  if (!unidad) throw new Error("Unidad no encontrada");

  return {
    cantReparaciones: unidad.cantReparaciones || 0,
  };
};

export const asignarUnidad = async (unidadId, ubicacionId, cantidad = null) => {
  const obra = await Obra.findById(ubicacionId);
  if (!obra) throw new Error("Obra no encontrada");

  const unidad = await Unidad.findById(unidadId).populate("equipo");
  if (!unidad) throw new Error("Unidad no encontrada");

  if (unidad.estado === "Dada de Baja") {
    throw new Error("No se puede asignar una unidad dada de baja");
  }

  if (unidad.estado === "En mantenimiento") {
    throw new Error("No se puede asignar una unidad en mantenimiento");
  }

  const cantidadActual = getCantidadUnidad(unidad);
  const cantidadAsignar =
    cantidad === null || cantidad === undefined || cantidad === ""
      ? cantidadActual
      : normalizarCantidad(cantidad, cantidadActual);
  const modoGestion = unidad.equipo?.modoGestion || "unidad";

  if (modoGestion !== "lote" && cantidadAsignar !== 1) {
    throw new Error("Este equipo se maneja por unidad");
  }

  if (cantidadAsignar > cantidadActual) {
    throw new Error("La cantidad solicitada supera la cantidad disponible");
  }

  if (cantidadAsignar < cantidadActual) {
    unidad.cantidad = cantidadActual - cantidadAsignar;
    await unidad.save();

    const unidadAsignada = await Unidad.create({
      equipo: getEquipoId(unidad.equipo),
      descripcion: unidad.descripcion || "",
      identificador: await generarIdentificadorUnidad(unidad.equipo, true),
      cantidad: cantidadAsignar,
      estado: "Asignada",
      ubicacion: ubicacionId,
      fechaCompra: unidad.fechaCompra,
    });

    return {
      unidad: unidadAsignada,
      unidadOrigen: unidad,
      cantidadAsignada: cantidadAsignar,
    };
  }

  unidad.cantidad = cantidadActual;
  unidad.ubicacion = ubicacionId;
  unidad.estado = "Asignada";

  await unidad.save();
  return {
    unidad,
    cantidadAsignada: cantidadAsignar,
  };
};

export const asignarCantidadLoteAObra = async ({
  equipoId,
  obraId,
  cantidad,
}) => {
  const equipo = await Equipo.findById(equipoId);
  if (!equipo) throw new Error("Equipo no encontrado");

  if ((equipo.modoGestion || "unidad") !== "lote") {
    throw new Error("Este equipo se maneja por unidad");
  }

  const obra = await Obra.findById(obraId);
  if (!obra) throw new Error("Obra no encontrada");

  if (cantidad === undefined || cantidad === null || cantidad === "") {
    throw new Error("Debe indicar la cantidad a asignar");
  }

  const cantidadSolicitada = normalizarCantidad(cantidad, 1);

  const lotesDisponibles = await Unidad.find({
    equipo: equipoId,
    estado: "Disponible",
    ubicacion: null,
  }).sort({ _id: 1 });

  const cantidadDisponible = lotesDisponibles.reduce(
    (total, lote) => total + getCantidadUnidad(lote),
    0,
  );

  if (cantidadSolicitada > cantidadDisponible) {
    throw new Error(
      `La cantidad solicitada supera el stock disponible (${cantidadDisponible})`,
    );
  }

  let restante = cantidadSolicitada;
  const unidadesAsignadas = [];
  const lotesActualizados = [];

  for (const lote of lotesDisponibles) {
    if (restante <= 0) break;

    const cantidadLote = getCantidadUnidad(lote);
    const cantidadTomada = Math.min(restante, cantidadLote);

    if (cantidadTomada === cantidadLote) {
      lote.cantidad = cantidadLote;
      lote.ubicacion = obraId;
      lote.estado = "Asignada";
      await lote.save();
      unidadesAsignadas.push(lote);
    } else {
      lote.cantidad = cantidadLote - cantidadTomada;
      await lote.save();
      lotesActualizados.push(lote);

      const unidadAsignada = await Unidad.create({
        equipo: equipoId,
        descripcion: lote.descripcion || "",
        identificador: await generarIdentificadorUnidad(equipo, true),
        cantidad: cantidadTomada,
        estado: "Asignada",
        ubicacion: obraId,
        fechaCompra: lote.fechaCompra,
      });

      unidadesAsignadas.push(unidadAsignada);
    }

    restante -= cantidadTomada;
  }

  return {
    message: "Lote asignado correctamente",
    equipoId,
    obraId,
    cantidadSolicitada,
    cantidadAsignada: cantidadSolicitada - restante,
    disponibleRestante: cantidadDisponible - cantidadSolicitada,
    registrosAsignados: unidadesAsignadas.length,
    unidadesAsignadas,
    lotesActualizados,
  };
};

export const agregarUnidadesAEquipo = async ({ equipoId, cantidad }) => {
  const equipo = await Equipo.findById(equipoId);
  if (!equipo) throw new Error("Equipo no encontrado");

  if (!equipo.codigo) {
    throw new Error("El equipo no tiene código asignado");
  }

  const cantidadFinal = normalizarCantidad(cantidad, 1);
  const esLote = equipo.modoGestion === "lote";
  const unidades = [];

  if (esLote) {
    unidades.push({
      equipo: equipoId,
      identificador: await generarIdentificadorUnidad(equipo, true),
      cantidad: cantidadFinal,
    });
  } else {
    const existentes = await Unidad.countDocuments({ equipo: equipoId });

    for (let i = 1; i <= cantidadFinal; i++) {
      const n = existentes + i;

      unidades.push({
        equipo: equipoId,
        identificador: `${equipo.codigo}-${n}`,
        cantidad: 1,
      });
    }
  }

  const creadas = await Unidad.insertMany(unidades);
  return creadas;
};

export const eliminarUnidad = async (id) => {
  const unidad = await Unidad.findByIdAndDelete(id);
  if (!unidad) throw new Error("Unidad no encontrada");
  return unidad;
};

export const finalizarMantenimiento = async (id, usuario = null) => {
  const unidad = await Unidad.findById(id);
  if (!unidad) throw new Error("Unidad no encontrada");

  // encontrar la última entrada de historial sin fechaFin
  if (
    Array.isArray(unidad.historialMantenimiento) &&
    unidad.historialMantenimiento.length
  ) {
    for (let i = unidad.historialMantenimiento.length - 1; i >= 0; i--) {
      const h = unidad.historialMantenimiento[i];
      if (!h.fechaFin) {
        h.fechaFin = new Date();
        break;
      }
    }
  }

  unidad.estado = "Disponible";
  await unidad.save();
  return unidad;
};

export const actualizarFechaCompra = async (id, fechaCompra) => {
  const unidad = await Unidad.findById(id);
  if (!unidad) throw new Error("Unidad no encontrada");

  let fecha = new Date(fechaCompra);
  fecha.setUTCHours(0, 0, 0, 0);

  // ✔ sumar un día para compensar desfase
  fecha.setDate(fecha.getDate() + 1);

  unidad.fechaCompra = fecha;
  await unidad.save();

  return unidad;
};

const obtenerIdsDisponiblesPorCantidad = async (equipoId, cantidad) => {
  const stockDisponible = await Unidad.countDocuments({
    equipo: equipoId,
    estado: "Disponible",
  });

  if (stockDisponible < cantidad) {
    const error = new Error(
      `Stock disponible insuficiente. Disponibles: ${stockDisponible}`,
    );
    error.statusCode = 400;
    error.stockDisponible = stockDisponible;
    throw error;
  }

  const unidades = await Unidad.find({
    equipo: equipoId,
    estado: "Disponible",
  })
    .select("_id")
    .sort({ _id: 1 })
    .limit(cantidad);

  if (unidades.length < cantidad) {
    const error = new Error(
      `Stock disponible insuficiente. Disponibles: ${unidades.length}`,
    );
    error.statusCode = 400;
    error.stockDisponible = unidades.length;
    throw error;
  }

  return {
    ids: unidades.map((unidad) => unidad._id),
    stockDisponible,
  };
};

export const ejecutarAccionMasivaPorCantidad = async ({
  equipoId,
  cantidad,
  accion,
  obraId,
  fechaCompra,
}) => {
  const cantidadNumero = Number(cantidad);

  if (!equipoId) {
    const error = new Error("Debe indicar el equipo");
    error.statusCode = 400;
    throw error;
  }

  if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
    const error = new Error("Debe indicar una cantidad valida");
    error.statusCode = 400;
    throw error;
  }

  if (!["baja", "asignar", "fecha"].includes(accion)) {
    const error = new Error("Accion masiva invalida");
    error.statusCode = 400;
    throw error;
  }

  if (accion === "asignar") {
    if (!obraId) {
      const error = new Error("Debe indicar la obra de destino");
      error.statusCode = 400;
      throw error;
    }

    const obra = await Obra.findById(obraId);
    if (!obra) {
      const error = new Error("Obra no encontrada");
      error.statusCode = 404;
      throw error;
    }
  }

  if (accion === "fecha" && !fechaCompra) {
    const error = new Error("Debe proporcionar una fecha de compra valida");
    error.statusCode = 400;
    throw error;
  }

  const { ids, stockDisponible } = await obtenerIdsDisponiblesPorCantidad(
    equipoId,
    cantidadNumero,
  );

  const resultados = await Promise.all(
    ids.map(async (id) => {
      try {
        let resultado;

        if (accion === "baja") {
          resultado = await bajaUnidad(id);
        } else if (accion === "asignar") {
          resultado = await asignarUnidad(id, obraId);
        } else {
          resultado = await actualizarFechaCompra(id, fechaCompra);
        }

        return { id, success: true, resultado };
      } catch (error) {
        return { id, success: false, error: error.message };
      }
    }),
  );

  const cantidadProcesada = resultados.filter(
    (resultado) => resultado.success,
  ).length;

  return {
    resultados,
    cantidadSolicitada: cantidadNumero,
    cantidadProcesada,
    stockDisponible,
  };
};

export const quitarUnidadDeObra = async (idUnidad, idObra) => {
  const unidad = await Unidad.findById(idUnidad);
  if (!unidad) throw new Error("Unidad no encontrada");
  unidad.ubicacion = null;
  unidad.estado = "Disponible";
  await unidad.save();

  // Si el modelo Obra tuviera un array `unidades`, lo actualizamos de forma segura.
  if (idObra) {
    const obra = await Obra.findById(idObra);
    if (obra && Array.isArray(obra.unidades)) {
      obra.unidades = obra.unidades.filter(
        (u) => u.toString() !== idUnidad.toString(),
      );
      await obra.save();
    }
  }

  return unidad;
};

export const trasladarUnidadesAotraObra = async ({
  obraOrigenId,
  obraDestinoId,
  unidadesIds,
}) => {
  const obraDestino = await Obra.findById(obraDestinoId);
  if (!obraDestino) throw new Error("La obra destino no existe");

  let query = {};

  if (unidadesIds && Array.isArray(unidadesIds) && unidadesIds.length > 0) {
    query = { _id: { $in: unidadesIds }, ubicacion: obraOrigenId };
  } else {
    query = { ubicacion: obraOrigenId };
  }

  const unidadesAMover = await Unidad.find(query);
  if (unidadesAMover.length === 0) {
    throw new Error(
      "No se encontraron unidades válidas para trasladar en la obra de origen",
    );
  }

  const idsAMover = unidadesAMover.map((u) => u._id);
  const cantidadTrasladada = unidadesAMover.reduce(
    (total, unidad) => total + getCantidadUnidad(unidad),
    0,
  );

  await Unidad.updateMany(
    { _id: { $in: idsAMover } },
    { $set: { ubicacion: obraDestinoId, estado: "Asignada" } },
  );

  const obraOrigen = await Obra.findById(obraOrigenId);
  if (obraOrigen && Array.isArray(obraOrigen.unidades)) {
    obraOrigen.unidades = obraOrigen.unidades.filter(
      (u) => !idsAMover.some((id) => id.toString() === u.toString()),
    );
    await obraOrigen.save();
  }

  if (obraDestino && Array.isArray(obraDestino.unidades)) {
    const nuevasFiltro = idsAMover.filter(
      (id) => !obraDestino.unidades.some((u) => u.toString() === id.toString()),
    );
    obraDestino.unidades.push(...nuevasFiltro);
    await obraDestino.save();
  }

  return {
    message: "Traslado realizado con éxito",
    cantidadTrasladada,
    registrosTrasladados: idsAMover.length,
  };
};

export const actualizarDescripcionUnidad = async (id, descripcion) => {
  const unidad = await Unidad.findById(id);
  if (!unidad) throw new Error("Unidad no encontrada");

  unidad.descripcion = descripcion;
  await unidad.save();
  
  return unidad;
};

export const actualizarEtiquetaUnidad = async (id, etiqueta) => {
  const unidad = await Unidad.findById(id);
  if (!unidad) throw new Error("Unidad no encontrada");

  unidad.etiqueta = etiqueta;
  await unidad.save();
  
  return unidad;
};
