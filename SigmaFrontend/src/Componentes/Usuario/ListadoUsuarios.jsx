import React, { useEffect, useState } from "react";
import Tabla from "../Tabla";
import "./ListadoUsuarios.css";

const ListadoUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

      {loading && <p>Cargando...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <Tabla columns={columns} data={usuarios} />
      )}
    </div>
  );
};

export default ListadoUsuarios;