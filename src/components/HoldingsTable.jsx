import React, { useState } from "react";

const fmtINR = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

const fmtNum = (val, decimals = 6) => {
  if (Math.abs(val) < 1e-10) return "~0";
  return parseFloat(val.toFixed(decimals)).toString();
};

const GainCell = ({ gain, balance }) => {
  const isNeg = gain < 0;
  const isZero = Math.abs(gain) < 1e-10;
  return (
    <div className="gain-cell">
      <span className={`gain-amount ${isNeg ? "neg" : isZero ? "zero" : "pos"}`}>
        {isZero ? "—" : fmtINR(gain)}
      </span>
      {!isZero && (
        <span className="gain-balance">{fmtNum(balance)} units</span>
      )}
    </div>
  );
};

export default function HoldingsTable({ holdings, selected, onToggle, onToggleAll }) {
  const [sortKey, setSortKey] = useState("stcg");
  const [sortDir, setSortDir] = useState("desc");

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...holdings].sort((a, b) => {
    let av, bv;
    if (sortKey === "stcg") { av = a.stcg.gain; bv = b.stcg.gain; }
    else if (sortKey === "ltcg") { av = a.ltcg.gain; bv = b.ltcg.gain; }
    else if (sortKey === "price") { av = a.currentPrice; bv = b.currentPrice; }
    else { av = a.totalHolding; bv = b.totalHolding; }
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const allSelected = holdings.length > 0 && holdings.every((h, i) => selected.has(i));
  const someSelected = holdings.some((_, i) => selected.has(i));

  const SortIcon = ({ col }) => (
    <span className={`sort-icon ${sortKey === col ? "active" : ""}`}>
      {sortKey === col ? (sortDir === "desc" ? " ↓" : " ↑") : " ↕"}
    </span>
  );

  return (
    <div className="table-container">
      <div className="table-header-bar">
        <h3 className="table-title">Holdings</h3>
        <span className="holdings-count">{holdings.length} assets</span>
      </div>
      <div className="table-scroll">
        <table className="holdings-table">
          <thead>
            <tr>
              <th className="col-check">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = !allSelected && someSelected; }}
                    onChange={onToggleAll}
                  />
                  <span className="checkbox-custom" />
                </label>
              </th>
              <th className="col-asset">Asset</th>
              <th className="col-holding" onClick={() => handleSort("holding")}>
                Holdings / Avg Buy<SortIcon col="holding" />
              </th>
              <th className="col-price" onClick={() => handleSort("price")}>
                Current Price<SortIcon col="price" />
              </th>
              <th className="col-stcg" onClick={() => handleSort("stcg")}>
                Short-Term Gain<SortIcon col="stcg" />
              </th>
              <th className="col-ltcg" onClick={() => handleSort("ltcg")}>
                Long-Term Gain<SortIcon col="ltcg" />
              </th>
              <th className="col-sell">Amount to Sell</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((holding, idx) => {
              const origIdx = holdings.indexOf(holding);
              const isSelected = selected.has(origIdx);
              return (
                <tr
                  key={`${holding.coin}-${idx}`}
                  className={`holding-row ${isSelected ? "row-selected" : ""}`}
                  onClick={() => onToggle(origIdx)}
                >
                  <td className="col-check" onClick={(e) => e.stopPropagation()}>
                    <label className="checkbox-wrap">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(origIdx)}
                      />
                      <span className="checkbox-custom" />
                    </label>
                  </td>
                  <td className="col-asset">
                    <div className="asset-cell">
                      <div className="asset-logo-wrap">
                        <img
                          src={holding.logo}
                          alt={holding.coin}
                          className="asset-logo"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div className="asset-logo-fallback" style={{ display: "none" }}>
                          {holding.coin.slice(0, 2)}
                        </div>
                      </div>
                      <div className="asset-info">
                        <span className="asset-symbol">{holding.coin}</span>
                        <span className="asset-name">{holding.coinName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="col-holding">
                    <div className="holding-cell">
                      <span className="holding-amount">{fmtNum(holding.totalHolding)} {holding.coin}</span>
                      <span className="holding-avg">Avg: {fmtINR(holding.averageBuyPrice)}</span>
                    </div>
                  </td>
                  <td className="col-price">
                    <span className="price-value">{fmtINR(holding.currentPrice)}</span>
                  </td>
                  <td className="col-stcg">
                    <GainCell gain={holding.stcg.gain} balance={holding.stcg.balance} />
                  </td>
                  <td className="col-ltcg">
                    <GainCell gain={holding.ltcg.gain} balance={holding.ltcg.balance} />
                  </td>
                  <td className="col-sell">
                    {isSelected ? (
                      <div className="sell-amount">
                        <span className="sell-units">{fmtNum(holding.totalHolding)}</span>
                        <span className="sell-coin">{holding.coin}</span>
                      </div>
                    ) : (
                      <span className="sell-empty">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
