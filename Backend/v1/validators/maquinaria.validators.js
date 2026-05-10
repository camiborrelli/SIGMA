import Joi from "joi";

export const registrarMaquinariaSchema = Joi.object({
  nombre: Joi.string().required().messages({
    "string.empty": "El nombre de la maquinaria es obligatorio",
  }),
  tipo: Joi.string().valid("Maquina", "Herramienta").required().messages({
    "any.only": 'El tipo debe ser "Maquina" o "Herramienta"',
    "string.empty": "El tipo de la maquinaria es obligatorio",
  }),
  modelo: Joi.string().optional(),
  modelo: Joi.string().required().messages({
    "string.empty": '"modelo" no puede estar vacío',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "El stock debe ser un número",
    "number.integer": "El stock debe ser un número entero",
    "number.min": "El stock no puede ser negativo",
    "any.required": "El stock es obligatorio",
  }),
  fechaCompra: Joi.date().iso().optional().messages({
    "date.format": '"fechaCompra" debe estar en formato de fecha ISO 8601',
    "date.base": '"fechaCompra" debe estar en formato de fecha ISO 8601',
  }),
  obraId: Joi.string().optional().allow(null, ""),
});
