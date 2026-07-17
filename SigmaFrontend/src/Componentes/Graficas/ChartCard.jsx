import "./ChartCard.css";

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div className={`chart-card ${className}`.trim()}>
      <div className="chart-card-header">
        <h2 className="chart-title">{title}</h2>
        <p className="chart-subtitle">{subtitle}</p>
      </div>

      <div className="chart-wrapper">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;
