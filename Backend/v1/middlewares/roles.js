export const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== "Admin") {
    return res.status(403).json({
      error: "Acceso solo para administradores",
    });
  }
  next();
};