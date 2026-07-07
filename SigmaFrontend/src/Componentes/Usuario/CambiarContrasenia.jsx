import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./CambiarContrasenia.css";
import { API_URL } from "../../../api";

const CambiarContrasenia = ({ isOpen, onClose, desdePerfil = false }) => {
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [passwordEmail, setPasswordEmail] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  const readResponsePayload = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();

    try {
      return JSON.parse(text);
    } catch {
      return { error: text };
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (desdePerfil) {
      const usuarioIdLocal = localStorage.getItem("usuarioId");

      setRecoveryStep(2);
      setUsuarioId(usuarioIdLocal);
    } else {
      setRecoveryStep(1);
      setUsuarioId(null);
      setSolicitudEnviada(false);
    }
  }, [isOpen, desdePerfil]);

  const handleSolicitarRecuperacion = async (e) => {
    e.preventDefault();

    const email = recoveryEmail.trim();

    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoadingRecovery(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/recuperar-contrasenia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          frontendUrl: window.location.origin,
        }),
      });

      const data = await readResponsePayload(res);

      if (!res.ok) {
        if (res.status === 404) {
          toast.error(
            "El backend no tiene habilitada la ruta de recuperación de contraseña.",
          );
          return;
        }

        toast.error(
          data.error || "No se pudo enviar el correo de recuperación",
        );
        return;
      }

      setSolicitudEnviada(true);
      toast.success(
        data.message ||
          "Te enviamos un correo con las instrucciones para cambiar tu contraseña",
      );
    } catch (error) {
      console.error("Error al solicitar recuperación:", error);
      toast.error(error.message || "Error de conexión");
    } finally {
      setLoadingRecovery(false);
    }
  };

  const handleVerificarEmail = async (e) => {
    e.preventDefault();

    setLoadingRecovery(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/verificar-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: recoveryEmail,
          password: passwordEmail,
        }),
      });

      const data = await readResponsePayload(res);

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
        `${API_URL}/usuarios/${usuarioId}/cambiar-contrasenia-recuperar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nuevaContraseña: newPassword,
          }),
        },
      );

      const data = await readResponsePayload(res);

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
    setSolicitudEnviada(false);
    onClose();
  };

  const handleVolverPaso1 = () => {
    setRecoveryStep(1);
    setUsuarioId(null);
    setNewPassword("");
    setRecoveryEmail("");
    setConfirmPassword("");
    setPasswordEmail("");
    setSolicitudEnviada(false);
  };

  if (!isOpen) return null;

  if (!desdePerfil && solicitudEnviada) {
    return (
      <div className="modal-overlay-password">
        <div className="cambiar-contrasenia-modal recovery-success-modal">
          <h3>Revisa tu correo</h3>
          <p>
            Si la cuenta existe, te enviamos un enlace para cambiar la
            contraseña.
          </p>

          <div className="recovery-success-box">
            <span className="recovery-success-title">Correo enviado</span>
            <span className="recovery-success-text">
              Sigue las instrucciones del mensaje para definir una nueva
              contraseña.
            </span>
          </div>

          <button
            type="button"
            onClick={handleCerrarModal}
            className="btn-cancel"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay-password">
      <div className="cambiar-contrasenia-modal">
        {!desdePerfil ? (
          <form onSubmit={handleSolicitarRecuperacion}>
            <h3>Recuperar contraseña</h3>

            <p>
              Ingresa tu correo electrónico y te enviaremos un enlace para
              cambiar tu contraseña.
            </p>

            <input
              type="email"
              placeholder="Correo electrónico"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              disabled={loadingRecovery}
            />

            <button
              type="submit"
              disabled={loadingRecovery}
              className="btn-change"
            >
              {loadingRecovery
                ? "Enviando..."
                : "Enviar correo de recuperación"}
            </button>

            <button
              type="button"
              onClick={handleCerrarModal}
              className="btn-cancel"
            >
              Cerrar
            </button>
          </form>
        ) : recoveryStep === 1 ? (
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
