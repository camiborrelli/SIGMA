import React, { useState, useEffect } from "react";
// import Modal from "react-modal";
import toast from "react-hot-toast";
import "./CambiarContrasenia.css";
import "./PerfilUsuario.css";

const PerfilUsuario = () => {
  const [usuario, setUsuario] = useState(null);

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
    <div>
      <h2>Perfil de Usuario</h2>
      <div className="card-usuario">
        {usuario ? (
          <div>
            <p>
              <strong>Nombre:</strong> {usuario.nombre}
            </p>
            <p>
              <strong>Email:</strong> {usuario.email}
            </p>
            <p>
              <strong>Rol:</strong> {usuario.rol}
            </p>
          </div>
        ) : (
          <p>Usuario no encontrado</p>
        )}
        {/* <button onClick={() => navigate("/cambiar-contrasenia")}>
          Cambiar Contraseña
        </button> */}
      </div>
    </div>
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
