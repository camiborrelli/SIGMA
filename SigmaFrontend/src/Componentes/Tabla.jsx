const Table = ({ columns, data }) => {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th
              key={col.header || idx}
              style={{ border: "1px solid #ddd", padding: "8px" }}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col, j) => (
              <td
                key={col.header || j}
                style={{ border: "1px solid #ddd", padding: "8px" }}
              >
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
