import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../../../api";
import "./LoginRegistro.css";

const RestablecerContrasenia = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);

  const [nuevaContrasenia, setNuevaContrasenia] = useState("");
  const [confirmarContrasenia, setConfirmarContrasenia] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeOk, setMensajeOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const leerRespuesta = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return { error: text };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setMensajeOk(false);

    if (!token) {
      setMensaje("El enlace de recuperacion no incluye un token valido.");
      return;
    }

    if (!nuevaContrasenia || !confirmarContrasenia) {
      setMensaje("Completa ambos campos para continuar.");
      return;
    }

    if (nuevaContrasenia !== confirmarContrasenia) {
      setMensaje("Las contrasenias no coinciden.");
      return;
    }

    if (nuevaContrasenia.length < 6) {
      setMensaje("La contrasenia debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/usuarios/restablecer-contrasenia/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevaContrasenia, confirmarContrasenia }),
        },
      );

      const data = await leerRespuesta(response);

      if (!response.ok) {
        throw new Error(data.error || "No se pudo restablecer la contrasenia.");
      }

      setMensajeOk(true);
      setMensaje("Contrasenia actualizada correctamente. Ya puedes iniciar sesion.");
      setNuevaContrasenia("");
      setConfirmarContrasenia("");
      toast.success("Contrasenia actualizada correctamente");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (error) {
      const mensajeError =
        error instanceof TypeError
          ? "No se pudo conectar con el servidor. Revisa la conexion o intenta nuevamente en unos segundos."
          : error.message || "Error al restablecer la contrasenia.";

      setMensaje(mensajeError);
      toast.error(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container reset-password-page">
      <div className="card reset-password-card">
        <h2>Restablecer contrasenia</h2>
        <p className="subtitle">Ingresa una nueva contrasenia para tu usuario</p>

        {!token ? (
          <>
            <p className="error">El enlace de recuperacion es invalido o esta incompleto.</p>
            <p className="link">
              <Link className="accion" to="/login">
                Volver al login
              </Link>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Nueva contrasenia</label>
            <input
              type="password"
              value={nuevaContrasenia}
              onChange={(e) => setNuevaContrasenia(e.target.value)}
              disabled={loading || mensajeOk}
              minLength={6}
              autoComplete="new-password"
            />

            <label>Confirmar contrasenia</label>
            <input
              type="password"
              value={confirmarContrasenia}
              onChange={(e) => setConfirmarContrasenia(e.target.value)}
              disabled={loading || mensajeOk}
              minLength={6}
              autoComplete="new-password"
            />

            {mensaje && (
              <p className={mensajeOk ? "success" : "error"}>{mensaje}</p>
            )}

            <button
              className="btn btn-register reset-password-btn"
              disabled={loading || mensajeOk}
            >
              {loading ? "Actualizando..." : "Actualizar contrasenia"}
            </button>

            <p className="link">
              <Link className="accion" to="/login">
                Volver al login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default RestablecerContrasenia;
