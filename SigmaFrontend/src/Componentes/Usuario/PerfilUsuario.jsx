import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "./CambiarContrasenia.css";
import "./PerfilUsuario.css";
import CambiarContrasenia from "./CambiarContrasenia";
import { TbLockPassword } from "react-icons/tb";
import Mapa from "../Mapa/Mapa";
import Dashboard from "../Dashboard/Dashboard";

const PerfilUsuario = () => {
  const [usuario, setUsuario] = useState(null);
  const [mostrarCambiarContrasenia, setMostrarCambiarContrasenia] =
    useState(false);

  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [mostrarPerfil, setMostrarPerfil] = useState(true);
  const [mostrarGestion, setMostrarGestion] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUsuario(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error al cargar usuario:", e);
      setUsuario(null);
    }
  }, []);

  return (
    <>
      {mostrarMapa ? (
        <Mapa />
      ) : mostrarGestion ? (
        <Dashboard />
      ) : (
        <div className="perfil-usuario-container">
          <div className="card-usuario">
            {usuario ? (
              <>
                <div className="usuario-header">
                  <div className="usuario-avatar">
                    {usuario.nombre?.charAt(0).toUpperCase()}
                  </div>

                  <h2 className="usuario-titulo">{usuario.nombre}</h2>

                  <p className="usuario-subtitulo">Información del usuario</p>
                </div>

                <div className="usuario-info">
                  <div className="usuario-item">
                    <span className="usuario-label">Nombre</span>
                    <span className="usuario-value">{usuario.nombre}</span>
                  </div>

                  <div className="usuario-item">
                    <span className="usuario-label">Email</span>
                    <span className="usuario-value">{usuario.email}</span>
                  </div>

                  <div className="usuario-item">
                    <span className="usuario-label">Rol</span>
                    <span className="usuario-value">{usuario.rol}</span>
                  </div>
                </div>

                <button onClick={() => setMostrarCambiarContrasenia(true)}>
                  Cambiar Contraseña <TbLockPassword />
                </button>

                <button
                  className="btn-edit"
                  onClick={() =>
                    alert("Funcionalidad de edición de perfil en desarrollo")
                  }
                >
                  Editar Perfil
                </button>
              </>
            ) : (
              <p>Usuario no encontrado</p>
            )}
          </div>

          <CambiarContrasenia
            isOpen={mostrarCambiarContrasenia}
            onClose={() => setMostrarCambiarContrasenia(false)}
            desdePerfil={true}
          />
        </div>
      )}
    </>
  );
};

export default PerfilUsuario;

// const CambiarContrasenia = ({ isOpen, onClose }) => {
//   const [recoveryStep, setRecoveryStep] = useState(1);
//   const [recoveryEmail, setRecoveryEmail] = useState("");
//   const [usuarioId, setUsuarioId] = useState(null);
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loadingRecovery, setLoadingRecovery] = useState(false);

//   const handleVerificarEmail = async () => {
//     if (!recoveryEmail) {
//       toast.error("Por favor ingresa tu correo electrónico");
//       return;
//     }
//     setLoadingRecovery(true);
//     try {
//       const res = await fetch(
//         "http://localhost:5001/usuarios/verificar-email",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ email: recoveryEmail }),
//         },
//       );
//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.error || "Email no registrado");
//         return;
//       }
//       setUsuarioId(data.usuarioId);
//       setRecoveryStep(2);
//       toast.success("Email verificado. Por favor ingresa tu nueva contraseña");
//     } catch (error) {
//       toast.error("Error al verificar email");
//     } finally {
//       setLoadingRecovery(false);
//     }
//   };

//   const handleCambiarContraseña = async () => {
//     if (!newPassword || !confirmPassword) {
//       toast.error("Por favor completa ambos campos");
//       return;
//     }
//     if (newPassword !== confirmPassword) {
//       toast.error("Las contraseñas no coinciden");
//       return;
//     }
//     if (newPassword.length < 6) {
//       toast.error("La contraseña debe tener al menos 6 caracteres");
//       return;
//     }
//     setLoadingRecovery(true);
//     try {
//       const res = await fetch(
//         "http://localhost:5001/usuarios/cambiar-contrasenia",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ usuarioId, newPassword }),
//         },
//       );
//       const data = await res.json();
//       if (!res.ok) {
//         toast.error(data.error || "Error al cambiar contraseña");
//         return;
//       }
//       toast.success("Contraseña cambiada correctamente");
//       onClose();
//     } catch (error) {
//       toast.error("Error al cambiar contraseña");
//     } finally {
//       setLoadingRecovery(false);
//     }
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={onClose}
//       className="cambiar-contrasenia-modal"
//     >
//       <h2>Cambiar Contraseña</h2>
//       {recoveryStep === 1 ? (
//         <div>
//           <p>Ingresa tu correo electrónico para verificar tu identidad:</p>
//           <input
//             type="email"
//             value={recoveryEmail}
//             onChange={(e) => setRecoveryEmail(e.target.value)}
//             placeholder="Correo electrónico"
//           />
//           <button onClick={handleVerificarEmail} disabled={loadingRecovery}>
//             {loadingRecovery ? "Verificando..." : "Verificar Email"}
//           </button>
//         </div>
//       ) : (
//         <div>
//           <p>Ingresa tu nueva contraseña:</p>
//           <input
//             type="password"
//             value={newPassword}
//             onChange={(e) => setNewPassword(e.target.value)}
//             placeholder="Nueva contraseña"
//           />
//           <input
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             placeholder="Confirmar nueva contraseña"
//           />
//           <button onClick={handleCambiarContraseña} disabled={loadingRecovery}>
//             {loadingRecovery ? "Cambiando..." : "Cambiar Contraseña"}
//           </button>
//           <button onClick={handleVolverPaso1} disabled={loadingRecovery}>
//             Volver
//           </button>
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default { PerfilUsuario, CambiarContrasenia };
