import "./Tabla.css";

const Table = ({ columns, data }) => {
  return (
    <table className="sigma-table">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={col.header || idx} className="sigma-th">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? "sigma-tr" : "sigma-tr alt"}>
            {columns.map((col, j) => (
              <td key={col.header || j} className="sigma-td">
                {typeof col.accessor === "function"
                  ? col.accessor(row)
                  : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
