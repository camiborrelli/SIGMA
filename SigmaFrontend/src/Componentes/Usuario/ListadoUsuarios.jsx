import React, { useEffect, useState } from "react";
import Tabla from "../Tabla";
import "./ListadoUsuarios.css";
import Buscador from "./Buscador";
import BajaUsuarioModal from "./BajaUsuarioModal";
import toast from "react-hot-toast";

const ListadoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModalBaja, setShowModalBaja] = useState(false);
  const [usuarioABaja, setUsuarioABaja] = useState(null);
  const [mostrarInactivos, setMostrarInactivos] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const [usuariosPorPagina, setUsuariosPorPagina] = useState(6);

  useEffect(() => {
    const actualizarCantidad = () => {
      const width = window.innerWidth;

      if (width <= 768) {
        setUsuariosPorPagina(4); // mobile
      } else if (width <= 1024) {
        setUsuariosPorPagina(5); // tablet
      } else {
        setUsuariosPorPagina(6); // desktop
      }
    };

    actualizarCantidad();
    window.addEventListener("resize", actualizarCantidad);

    return () => window.removeEventListener("resize", actualizarCantidad);
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [usuariosPorPagina]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        const res = await fetch("http://localhost:5001/usuarios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Error al obtener usuarios");
          setUsuarios([]);
        } else {
          setUsuarios(data.usuarios);
        }
      } catch (err) {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  const usuariosFiltrados = usuarios
    .filter((u) => {
      const texto = `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    })
    .filter((u) => {
      if (mostrarInactivos) {
        return u.estado === "Inactivo";
      }
      return u.estado !== "Inactivo";
    })
    .sort((a, b) =>
      a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase())
    );

  const totalPaginas = Math.ceil(usuariosFiltrados.length / usuariosPorPagina);

  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const indiceFin = indiceInicio + usuariosPorPagina;

  const usuariosPaginados = usuariosFiltrados.slice(indiceInicio, indiceFin);

  const cambiarRol = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:5001/usuarios/${id}/rol`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rol: "Admin" }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al cambiar rol");
        return;
      }
      toast.success("Rol cambiado a Admin correctamente");
      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const darDeBajaUsuario = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5001/usuarios/${id}/baja`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al dar de baja al usuario");
        return;
      }
      toast.success("Usuario dado de baja correctamente");
      setUsuarios((prev) => prev.filter((u) => u._id !== id));
      setShowModalBaja(false);
      setUsuarioABaja(null);
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const reactivarUsuario = async (id) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5001/usuarios/${id}/reactivar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al reactivar usuario");
        return;
      }
      toast.success("Usuario reactivado correctamente");
      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  const columns = mostrarInactivos
    ? [
        { header: "Nombre", accessor: "nombre" },
        { header: "Apellido", accessor: "apellido" },
        { header: "Email", accessor: "email" },
        {
          header: "Acciones",
          accessor: (row) => (
            <button
              className="btn-reactivar"
              onClick={() => reactivarUsuario(row._id)}
            >
              Reactivar
            </button>
          ),
        },
      ]
    : [
        { header: "Nombre", accessor: "nombre" },
        { header: "Apellido", accessor: "apellido" },
        { header: "Email", accessor: "email" },
        {
          header: "Rol",
          accessor: () => (
            <span className="estado-funcionario">Funcionario</span>
          ),
        },
        {
          header: "Acciones",
          accessor: (row) => (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn-cambiar-rol"
                onClick={() => cambiarRol(row._id)}
              >
                Cambiar rol
              </button>
              <button
                className="btn-dar-baja"
                onClick={() => {
                  setUsuarioABaja(row);
                  setShowModalBaja(true);
                }}
              >
                Dar de baja
              </button>
            </div>
          ),
        },
      ];

  return (
    <div className="usuarios-container">
      <h2 className="titulo">Gestión de usuarios</h2>
      <p className="subtitulo-admin">Administra los funcionarios del sistema</p>
      
      <div className="filters-container">
        <div className="buscador-wrapper">
          <Buscador
            value={busqueda}
            onChange={(val) => {
              setBusqueda(val);
              setPaginaActual(1);
            }}
            placeholder="Buscar funcionario..."
          />
        </div>

        <button
          className="btn-bajas"
          onClick={() => {
            setMostrarInactivos(!mostrarInactivos);
            setPaginaActual(1);
          }}
        >
          {mostrarInactivos
            ? "Volver a funcionarios activos"
            : "Ver usuarios dados de baja"}
        </button>
      </div>

      <div className="listado-card-header-label">
        <h3>
          {mostrarInactivos
            ? "Usuarios dados de baja"
            : "Listado de funcionarios"}
        </h3>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="tabla-desktop">
            <Tabla columns={columns} data={usuariosPaginados} />
          </div>

          <div className="usuarios-mobile">
            {usuariosPaginados.map((u) => (
              <div key={u._id} className="usuario-card">
                <div className="usuario-card-header">
                  <span className="usuario-nombre-card">
                    {u.nombre} {u.apellido}
                  </span>

                  <span className="usuario-rol">Funcionario</span>
                </div>

                <div className="usuario-info">
                  <p>
                    <strong>Email:</strong> {u.email}
                  </p>
                </div>

                <div className="card-acciones">
                  {mostrarInactivos ? (
                    <button
                      className="btn-reactivar"
                      onClick={() => reactivarUsuario(u._id)}
                    >
                      Reactivar
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn-cambiar-rol"
                        onClick={() => cambiarRol(u._id)}
                      >
                        Cambiar rol
                      </button>
                      <button
                        className="btn-dar-baja"
                        onClick={() => {
                          setUsuarioABaja(u);
                          setShowModalBaja(true);
                        }}
                      >
                        Dar de baja
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="paginacion">
              <button
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(paginaActual - 1)}
              >
                ⬅
              </button>

              <span>
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual(paginaActual + 1)}
              >
                ➡
              </button>
            </div>
          )}
        </>
      )}

      {showModalBaja && (
        <BajaUsuarioModal
          usuario={usuarioABaja}
          isOpen={showModalBaja}
          onClose={() => {
            setShowModalBaja(false);
            setUsuarioABaja(null);
          }}
          onConfirm={darDeBajaUsuario}
        />
      )}
    </div>
  );
};

export default ListadoUsuarios;