const Table = ({ columns, data }) => {
  return (
    <table style={{ borderCollapse: "collapse", width: "100%" }}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.accessor}
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
            {columns.map((col) => (
              <td
                key={col.accessor}
                style={{ border: "1px solid #ddd", padding: "8px" }}
              >
                {row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
