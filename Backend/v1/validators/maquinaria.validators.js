import Joi from "joi";

export const registrarMaquinariaSchema = Joi.object({
  nombre: Joi.string().required().messages({
    "string.empty": "El nombre de la maquinaria es obligatorio",
  }),
  tipo: Joi.string().required().messages({
    "string.empty": "El tipo de la maquinaria es obligatorio",
  }),
  estado: Joi.string()
    .valid("Disponible", "En mantenimiento", "Fuera de servicio", "Asignada")
    .required()
    .default("Disponible"),
  obraId: Joi.string().required().messages({
    "string.empty": "El ID de la obra es obligatorio",
  }),
});
