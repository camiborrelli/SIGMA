import Joi from "joi";

export const registrarObraSchema = Joi.object({
  nombre: Joi.string().trim().min(1).required().messages({
    "string.empty": "El nombre de la obra es obligatorio",
    "string.min": "El nombre de la obra no puede estar vacío",
  }),
  ubicacion: Joi.string().trim().min(1).required().messages({
    "string.empty": "La ubicación de la obra es obligatoria",
    "string.min": "La ubicación de la obra no puede estar vacía",
  }),
  fechaInicio: Joi.date().iso().required().messages({
    "date.base": "La fecha de inicio debe ser una fecha válida",
    "any.required": "La fecha de inicio es obligatoria",
  }),
  fechaFin: Joi.date()
    .iso()
    .greater(Joi.ref("fechaInicio"))
    .required()
    .messages({
      "date.base": "La fecha de fin debe ser una fecha válida",
      "date.greater": "La fecha de fin debe ser posterior a la fecha de inicio",
      "any.required": "La fecha de fin es obligatoria",
    }),
  estado: Joi.string()
    .trim()
    .valid("Activa", "Finalizada", "Cancelada")
    .required()
    .messages({
      "any.only": 'El estado debe ser "Activa", "Finalizada" o "Cancelada"',
      "string.empty": "El estado de la obra es obligatorio",
    }),
});
