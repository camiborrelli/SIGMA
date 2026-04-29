import React, { useEffect, useState } from "react";
import Tabla from "../Tabla";
import "./ListadoUsuarios.css";
import Buscador from "./Buscador";

const ListadoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);

  const [usuariosPorPagina, setUsuariosPorPagina] = useState(6);

  useEffect(() => {
    const actualizarCantidad = () => {
      const width = window.innerWidth;

      if (width <= 768) {
        setUsuariosPorPagina(4); //mobile
      } else if (width <= 1024) {
        setUsuariosPorPagina(5); //tablet
      } else {
        setUsuariosPorPagina(6); //desktop
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
    .sort((a, b) =>
      a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase())
    );

  const totalPaginas = Math.ceil(
    usuariosFiltrados.length / usuariosPorPagina
  );

  const indiceInicio = (paginaActual - 1) * usuariosPorPagina;
  const indiceFin = indiceInicio + usuariosPorPagina;

  const usuariosPaginados = usuariosFiltrados.slice(
    indiceInicio,
    indiceFin
  );

  //Cambiar rol a Admin
  const cambiarRol = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `http://localhost:5001/usuarios/${id}/rol`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rol: "Admin" }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al cambiar rol");
        return;
      }

      setUsuarios((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Error de conexión");
    }
  };

  const columns = [
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
        <button
          className="btn-cambiar-rol"
          onClick={() => cambiarRol(row._id)}
        >
          Cambiar rol
        </button>
      ),
    },
  ];

  return (
    <div className="usuarios-container">
      <h2 className="titulo">Listado de funcionarios</h2>

      <Buscador
        value={busqueda}
        onChange={(val) => {
          setBusqueda(val);
          setPaginaActual(1);
        }}
        placeholder="Buscar funcionario..."
      />

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

                  <span className={`usuario-rol ${u.rol.toLowerCase()}`}>
                    {u.rol}
                  </span>
                </div>

                <div className="usuario-info">
                  <p><strong>Email:</strong> {u.email}</p>
                </div>

                <button
                  className="btn-cambiar-rol"
                  onClick={() => cambiarRol(u._id)}
                >
                  Hacer admin
                </button>
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
    </div>
  );
};

export default ListadoUsuarios;