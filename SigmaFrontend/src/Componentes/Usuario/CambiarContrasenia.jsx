import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./CambiarContrasenia.css";

const CambiarContrasenia = ({ isOpen, onClose, desdePerfil = false }) => {
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [passwordEmail, setPasswordEmail] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (desdePerfil) {
      const usuarioIdLocal = localStorage.getItem("usuarioId");

      setRecoveryStep(2);
      setUsuarioId(usuarioIdLocal);
    } else {
      setRecoveryStep(1);
      setUsuarioId(null);
    }
  }, [isOpen, desdePerfil]);

  const handleVerificarEmail = async (e) => {
    e.preventDefault();

    setLoadingRecovery(true);

    try {
      const res = await fetch(
        "http://localhost:5001/usuarios/verificar-email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: recoveryEmail,
            password: passwordEmail,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Email no registrado");
        return;
      }

      setUsuarioId(data.usuarioId);
      setRecoveryStep(2);

      toast.success("Email verificado. Por favor ingresa tu nueva contraseña");
    } catch (error) {
      toast.error("Email o contraseña incorrectos");
    } finally {
      setLoadingRecovery(false);
    }
  };

  const handleCambiarContraseña = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Por favor completa ambos campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoadingRecovery(true);

    try {
      const res = await fetch(
        `http://localhost:5001/usuarios/${usuarioId}/cambiar-contrasenia-recuperar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nuevaContraseña: newPassword,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al cambiar contraseña");
        return;
      }

      toast.success("Contraseña cambiada exitosamente");
      handleCerrarModal();
    } catch (error) {
      console.error("Error en cambiarContraseña:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setLoadingRecovery(false);
    }
  };

  const handleCerrarModal = () => {
    setRecoveryStep(1);
    setRecoveryEmail("");
    setPasswordEmail("");
    setUsuarioId(null);
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  const handleVolverPaso1 = () => {
    setRecoveryStep(1);
    setUsuarioId(null);
    setNewPassword("");
    setRecoveryEmail("");
    setConfirmPassword("");
    setPasswordEmail("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content cambiar-contrasenia-modal">
        {recoveryStep === 1 ? (
          <form onSubmit={handleVerificarEmail}>
            <h3>Recuperar contraseña</h3>

            <p>
              Ingresa tu correo electrónico y contraseña para verificar tu
              cuenta.
            </p>

            <input
              type="email"
              placeholder="Correo electrónico"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              disabled={loadingRecovery}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={passwordEmail}
              onChange={(e) => setPasswordEmail(e.target.value)}
              disabled={loadingRecovery}
            />

            <button
              type="submit"
              disabled={loadingRecovery}
              className="btn-change"
            >
              {loadingRecovery ? "Verificando..." : "Verificar email"}
            </button>

            <button
              type="button"
              onClick={handleCerrarModal}
              className="btn-cancel"
            >
              Cerrar
            </button>
          </form>
        ) : (
          <>
            <h3>Cambiar contraseña</h3>

            <p>Ingresa tu nueva contraseña</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCambiarContraseña();
              }}
            >
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loadingRecovery}
              />

              <input
                type="password"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loadingRecovery}
              />

              <button
                type="submit"
                disabled={loadingRecovery}
                className="btn-change"
              >
                {loadingRecovery ? "Cambiando..." : "Cambiar contraseña"}
              </button>

              {/* {!desdePerfil && (
                <button
                  type="button"
                  onClick={handleVolverPaso1}
                  disabled={loadingRecovery}
                  className="btn-cancel"
                >
                  Volver
                </button>
              )} */}

              <button
                type="button"
                onClick={handleCerrarModal}
                className="btn-cancel"
              >
                Cerrar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default CambiarContrasenia;
