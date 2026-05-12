import "./Tabla.css";

const Table = ({ columns, data }) => {
  return (
    <div className="tabla-wrapper">
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
          {data.map((row, i) => {
            const rowKey =
              row && (row._id || row.id)
                ? String(row._id || row.id)
                : `row-${i}`;
            return (
              <tr
                key={rowKey}
                className={i % 2 === 0 ? "sigma-tr" : "sigma-tr alt"}
              >
                {columns.map((col, j) => (
                  <td
                    key={`${rowKey}-${col.header || j}`}
                    className="sigma-td"
                    data-label={
                      typeof col.header === "string" ? col.header : ""
                    }
                  >
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : row[col.accessor]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
