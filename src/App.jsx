import React, { useState, useEffect, useMemo } from "react";
import CapitalGainsCard from "./components/CapitalGainsCard";
import HoldingsTable from "./components/HoldingsTable";
import { fetchHoldings, fetchCapitalGains } from "./api/mockApi";
import "./App.css";

export default function App() {
  const [holdings, setHoldings] = useState([]);
  const [capitalGains, setCapitalGains] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchHoldings(), fetchCapitalGains()]).then(([h, cg]) => {
      setHoldings(h);
      setCapitalGains(cg);
      setLoading(false);
    });
  }, []);

  const handleToggle = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (selected.size === holdings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(holdings.map((_, i) => i)));
    }
  };

  const afterHarvestingData = useMemo(() => {
    if (!capitalGains) return null;

    let stcgProfits = capitalGains.capitalGains.stcg.profits;
    let stcgLosses = capitalGains.capitalGains.stcg.losses;
    let ltcgProfits = capitalGains.capitalGains.ltcg.profits;
    let ltcgLosses = capitalGains.capitalGains.ltcg.losses;

    selected.forEach((idx) => {
      const h = holdings[idx];
      if (!h) return;

      const stcgGain = h.stcg.gain;
      const ltcgGain = h.ltcg.gain;

      if (stcgGain > 0) stcgProfits += stcgGain;
      else if (stcgGain < 0) stcgLosses += Math.abs(stcgGain);

      if (ltcgGain > 0) ltcgProfits += ltcgGain;
      else if (ltcgGain < 0) ltcgLosses += Math.abs(ltcgGain);
    });

    return {
      capitalGains: {
        stcg: { profits: stcgProfits, losses: stcgLosses },
        ltcg: { profits: ltcgProfits, losses: ltcgLosses },
      },
    };
  }, [capitalGains, selected, holdings]);

  const savings = useMemo(() => {
    if (!capitalGains || !afterHarvestingData) return null;
    const { stcg: s1, ltcg: l1 } = capitalGains.capitalGains;
    const { stcg: s2, ltcg: l2 } = afterHarvestingData.capitalGains;
    const pre = (s1.profits - s1.losses) + (l1.profits - l1.losses);
    const post = (s2.profits - s2.losses) + (l2.profits - l2.losses);
    return pre > post ? pre - post : null;
  }, [capitalGains, afterHarvestingData]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading portfolio data...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-bg" />
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-area">
            <div className="logo-icon">⚡</div>
            <div>
              <h1 className="app-title">Tax Loss Harvesting</h1>
              <p className="app-subtitle">Optimise your crypto tax liability</p>
            </div>
          </div>
          <div className="header-tag">FY 2024–25</div>
        </div>
      </header>

      <main className="app-main">
        <div className="info-banner">
          <span className="info-icon">ℹ</span>
          <p>
            Select holdings below to simulate tax loss harvesting. The "After Harvesting" card will update in real-time to show your potential tax savings.
          </p>
        </div>

        <div className="cards-grid">
          <CapitalGainsCard data={capitalGains} variant="pre" />
          <CapitalGainsCard data={afterHarvestingData} variant="post" savings={savings} />
        </div>

        <HoldingsTable
          holdings={holdings}
          selected={selected}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
        />
      </main>

      <footer className="app-footer">
        <p>Tax calculations are estimates. Consult a financial advisor for professional advice.</p>
      </footer>
    </div>
  );
}
