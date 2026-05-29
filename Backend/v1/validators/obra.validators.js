import Joi from "joi";

export const registrarObraSchema = Joi.object({
  nombre: Joi.string().trim().min(1).required().messages({
    "string.empty": "El nombre de la obra es obligatorio",
    "string.min": "El nombre de la obra no puede estar vacío",
  }),
  // latitud: Joi.string().trim().min(1).required().messages({
  //   "string.empty": "La latitud de la obra es obligatoria",
  //   "string.min": "La latitud de la obra no puede estar vacía",
  // }),
  // longitud: Joi.string().trim().min(1).required().messages({
  //   "string.empty": "La longitud de la obra es obligatoria",
  //   "string.min": "La longitud de la obra no puede estar vacía",
  // }),
  ubicacion: Joi.string().trim().min(1).required().messages({
    "string.empty": "La ubicación de la obra es obligatoria",
    "string.min": "La ubicación de la obra no puede estar vacía",
  }),
  fechaInicio: Joi.date().iso().allow(null, "").messages({
    "date.base": "La fecha de inicio debe ser una fecha válida",
  }),

  estado: Joi.string()
    .trim()
    .valid("Activa", "Finalizada", "Cancelada")
    .default("Activa")
    .messages({
      "any.only": 'El estado debe ser "Activa", "Finalizada" o "Cancelada"',
      "string.empty": "El estado de la obra es obligatorio",
    }),
});
