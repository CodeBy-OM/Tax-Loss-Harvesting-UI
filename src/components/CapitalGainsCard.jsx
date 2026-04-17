import React from "react";

const fmt = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

const Row = ({ label, value, isNegative }) => (
  <div className="gain-row">
    <span className="gain-label">{label}</span>
    <span className={`gain-value ${isNegative ? "negative" : "positive"}`}>
      {fmt(Math.abs(value))}
      {isNegative && <span className="sign-badge loss">Loss</span>}
      {!isNegative && value > 0 && <span className="sign-badge profit">Profit</span>}
    </span>
  </div>
);

export default function CapitalGainsCard({ data, variant, savings }) {
  if (!data) return null;

  const { stcg, ltcg } = data.capitalGains;
  const stcgNet = stcg.profits - stcg.losses;
  const ltcgNet = ltcg.profits - ltcg.losses;
  const total = stcgNet + ltcgNet;

  const isDark = variant === "pre";

  return (
    <div className={`gains-card ${isDark ? "card-dark" : "card-blue"}`}>
      <div className="card-header">
        <div className="card-badge">{isDark ? "Pre" : "After"} Harvesting</div>
        <h2 className="card-title">
          {isDark ? "Current Capital Gains" : "After Tax Harvesting"}
        </h2>
      </div>

      <div className="gains-section">
        <div className="section-title">Short-Term Capital Gains</div>
        <div className="gains-rows">
          <Row label="Profits" value={stcg.profits} isNegative={false} />
          <Row label="Losses" value={stcg.losses} isNegative={true} />
          <div className="gain-row net-row">
            <span className="gain-label">Net STCG</span>
            <span className={`gain-value net-value ${stcgNet < 0 ? "negative" : "positive"}`}>
              {fmt(stcgNet)}
            </span>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="gains-section">
        <div className="section-title">Long-Term Capital Gains</div>
        <div className="gains-rows">
          <Row label="Profits" value={ltcg.profits} isNegative={false} />
          <Row label="Losses" value={ltcg.losses} isNegative={true} />
          <div className="gain-row net-row">
            <span className="gain-label">Net LTCG</span>
            <span className={`gain-value net-value ${ltcgNet < 0 ? "negative" : "positive"}`}>
              {fmt(ltcgNet)}
            </span>
          </div>
        </div>
      </div>

      <div className="total-bar">
        <span className="total-label">Realised Capital Gains</span>
        <span className={`total-value ${total < 0 ? "negative" : "positive"}`}>
          {fmt(total)}
        </span>
      </div>

      {!isDark && savings !== null && savings > 0 && (
        <div className="savings-banner">
          <span className="savings-icon">🎉</span>
          <span>
            You're going to save <strong>{fmt(savings)}</strong> in taxes!
          </span>
        </div>
      )}
    </div>
  );
}
