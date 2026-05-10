const BajaEquipo = ({ id }) => {
  const navigate = useNavigate();
  const maquinaria = buscarMaquinariaPorId(id);
  const [error, setError] = useState("");

  const buscarMaquinariaPorId = (id) => {
    const data = JSON.parse(localStorage.getItem("maquinaria")) || [];
    return data.find((m) => m._id === id);
  };

  const darDeBaja = async (id) => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    if (maquinaria?.estado === "De Baja") {
      return (
        <div className="baja-container">
          <h2>El equipo {maquinaria.nombre} ya se encuentra dado de baja.</h2>
          <div className="actions">
            <button
              className="btn-cancelar"
              onClick={() => navigate("/listadoGeneral")}
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
    try {
      const res = await fetch(`http://localhost:5001/maquinaria/baja/${id}`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Error al dar de baja");
        return;
      }
      await fetchMaquinaria();
    } catch (error) {
      console.error("Error al dar de baja:", error);
      setError("Error al dar de baja");
    }
  };

  const useEffect = () => {
    const state = window.history.state || {};
    const maquinaria = state?.maquinaria || null;
    if (maquinaria) {
      darDeBaja(maquinaria._id);
    } else {
      setError("ID de equipo no proporcionado");
    }
  };

  useEffect();

  return (
    <div className="baja-container">
      <h2>Dar de Baja Equipo</h2>
      <p>
        ¿Está seguro de que desea dar de baja el equipo{" "}
        {maquinaria?.nombre || "desconocido"}?
      </p>
      <div className="actions">
        <button onClick={() => darDeBaja(maquinaria?._id)}>
          Confirmar Baja
        </button>
        <button onClick={() => navigate("/listadoGeneral")}>Cancelar</button>
      </div>
    </div>
  );
};

export default BajaEquipo;
