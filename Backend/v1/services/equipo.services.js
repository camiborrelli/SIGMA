import mongoose from "mongoose";
import Equipo from "../models/equipo.model.js";
import Unidad from "../models/unidad.model.js";
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

export const crearEquipoConUnidades = async ({
nombre,
modelo,
tipo,
cantidad,
}) => {
const cantidadFinal = normalizarCantidad(cantidad, 1);

const equipo = await Equipo.create({
nombre,
modelo,
tipo,
});

const codigo = `EQ-${String(equipo._id).slice(-6).toUpperCase()}`;

equipo.codigo = codigo;
await equipo.save();

const unidades = [];

for (let i = 1; i <= cantidadFinal; i++) {
unidades.push({
equipo: equipo._id,
identificador: `${codigo}-${i}`,
descripcion: "",
etiqueta: null,
estado: "Disponible",
});
}

const unidadesCreadas = await Unidad.insertMany(unidades);

return {
equipo,
unidadesCreadas,
cantidadGenerada: cantidadFinal,
registrosGenerados: unidadesCreadas.length,
};
};

export const getEquiposConStock = async () => {
  return await Unidad.aggregate([
    {
      $group: {
        _id: "$equipo",

        stockTotal: {
          $sum: {
            $cond: [{ $ne: ["$estado", "Dada de Baja"] }, 1, 0],
          },
        },

        stockDisponible: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Disponible"] }, 1, 0],
          },
        },

        stockAsignado: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Asignada"] }, 1, 0],
          },
        },

        stockMantenimiento: {
          $sum: {
            $cond: [
              { $eq: ["$estado", "En mantenimiento"] },
              1,
              0,
            ],
          },
        },

        stockBaja: {
          $sum: {
            $cond: [{ $eq: ["$estado", "Dada de Baja"] }, 1, 0],
          },
        },

        registros: {
          $sum: 1,
        },
      },
    },

    {
      $lookup: {
        from: "equipos",
        localField: "_id",
        foreignField: "_id",
        as: "equipo",
      },
    },

    {
      $unwind: "$equipo",
    },

    {
      $project: {
        _id: "$equipo._id",
        nombre: "$equipo.nombre",
        modelo: "$equipo.modelo",
        tipo: "$equipo.tipo",
        codigo: "$equipo.codigo",

        stock: "$stockTotal",
        disponible: "$stockDisponible",
        asignado: "$stockAsignado",
        mantenimiento: "$stockMantenimiento",
        baja: "$stockBaja",
        registros: "$registros",
      },
    },

    {
      $sort: {
        nombre: 1,
        modelo: 1,
      },
    },
  ]);
};

export const getStatsEquipos = async () => {
const total = await Equipo.countDocuments();

return {
total,
};
};

export const editarEquipo = async (
id,
{
nombre,
modelo,
tipo,
},
) => {
const equipo = await Equipo.findById(id);

if (!equipo) {
throw new Error("Equipo no encontrado");
}

equipo.nombre = nombre;
equipo.modelo = modelo;
equipo.tipo = tipo;

const equipoGuardado = await equipo.save();

return equipoGuardado;
};
