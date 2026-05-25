import mongoose, { Schema } from "mongoose";

const getLatitudYLongitud = async (ubicacion) => {
  if (!ubicacion) return null;

  const query = encodeURIComponent(ubicacion);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SIGMA/1.0",
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!Array.isArray(data) || !data[0]) return null;

  const latitud = Number(data[0].lat);
  const longitud = Number(data[0].lon);

  if (Number.isNaN(latitud) || Number.isNaN(longitud)) return null;

  return { latitud, longitud };
};

export const ObraSchema = new Schema({
  nombre: String,
  ubicacion: String,
  latitud: Number,
  longitud: Number,
  fechaInicio: Date,
  fechaFin: Date,
  estado: {
    type: String,
    enum: ["Activa", "Finalizada", "Cancelada"],
    default: "Activa",
  },
  cantReactivaciones: { type: Number, default: 0 },
});

ObraSchema.pre("save", async function setGeoCoordinates(next) {
  if (!this.isModified("ubicacion") || !this.ubicacion) {
    return next();
  }

  try {
    const coordinates = await getLatitudYLongitud(this.ubicacion);

    if (coordinates) {
      this.latitud = coordinates.latitud;
      this.longitud = coordinates.longitud;
    } else {
      this.latitud = undefined;
      this.longitud = undefined;
    }
  } catch (error) {
    this.latitud = undefined;
    this.longitud = undefined;
  }

  next();
});

export default mongoose.model("Obra", ObraSchema);
