import { notificarGarantiasPorVencer } from "../services/garantia.services.js";

export const revisarGarantiasCronController = async (req, res) => {
  try {
    const resultado = await notificarGarantiasPorVencer(req.query.dias);

    res.status(200).json({
      message: "Revision de garantias por vencer ejecutada",
      ...resultado,
    });
  } catch (error) {
    console.error("Error en cron de garantias:", error);
    res.status(500).json({
      error: "Error al revisar garantias por vencer",
      message: error.message,
    });
  }
};
