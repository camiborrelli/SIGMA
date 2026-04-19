import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  //No hay header
  if (!authHeader) {
    return res.status(401).json({
      error: "Acceso denegado. Token requerido",
    });
  }

  //Formato incorrecto
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Formato de token inválido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = decoded; //Info del usuario

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
};