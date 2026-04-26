import "./Buscador.css";

const Buscador = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="buscador-container">

      <span className="buscador-icono">🔍</span>

      <input
        type="text"
        className="buscador-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {value && (
        <button
          className="buscador-clear"
          onClick={() => onChange("")}
        >
          ❌
        </button>
      )}
    </div>
  );
};

export default Buscador;