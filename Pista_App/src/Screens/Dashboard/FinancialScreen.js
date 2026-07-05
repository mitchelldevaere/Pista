import React, { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import NavBar from "../../Util/NavBar";
import "../../styles/getProduct.css"

const TOP_TABLES_COUNT = 10;

const FinancialScreen = () => {
  const history = useHistory();

  const [orderLines, setOrderLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allTimeRevenue, setAllTimeRevenue] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topTables, setTopTables] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState({ done: 0, total: 0 });

  const fetchOrders = async () => {
    try {
      const response = await fetch("https://lapista.depistezulte.be/api/orders");
      const data = await response.json();
      setOrderLines(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Kon de actieve bestellingen niet ophalen.");
    }
  };

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false));
    calculateAllTimeRevenue();

    // The all-time revenue is left out of this since it walks every order ever placed
    // and is too expensive to redo every minute - use the "Herbereken" button for that.
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 60000);

    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Orders are numbered sequentially starting at 1, and /api/order/:id returns every
  // order ever placed (with price/quantity per line), so all-time revenue is computed
  // by walking that full range - there is no bulk "all orders" endpoint.
  const orderExists = async (id) => {
    if (id < 1) return false;
    const response = await fetch(`https://lapista.depistezulte.be/api/order/${id}`);
    return response.ok;
  };

  const findMaxOrderId = async () => {
    let high = 1;
    while (await orderExists(high)) {
      high *= 2;
    }
    let low = Math.floor(high / 2);
    while (low + 1 < high) {
      const mid = Math.floor((low + high) / 2);
      if (await orderExists(mid)) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return low;
  };

  const toBrusselsDateString = (isoString) => {
    if (!isoString) return 'onbekend';
    return new Date(isoString).toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });
  };

  const calculateAllTimeRevenue = async () => {
    setCalculating(true);
    setAllTimeRevenue(null);
    try {
      const maxId = await findMaxOrderId();
      setCalcProgress({ done: 0, total: maxId });

      const batchSize = 25;
      let total = 0;
      const perDay = {};
      const perTable = {};

      for (let start = 1; start <= maxId; start += batchSize) {
        const ids = [];
        for (let id = start; id < start + batchSize && id <= maxId; id++) {
          ids.push(id);
        }
        const results = await Promise.all(
          ids.map((id) =>
            fetch(`https://lapista.depistezulte.be/api/order/${id}`)
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null)
          )
        );
        results.forEach((order) => {
          if (order && order.orderlines) {
            const orderTotal = order.orderlines.reduce(
              (sum, line) => sum + (line.prijs || 0) * (line.hoeveelheid || 0),
              0
            );
            total += orderTotal;

            const day = toBrusselsDateString(order.creation);
            perDay[day] = (perDay[day] || 0) + orderTotal;

            const tafel = order.tafel_id;
            perTable[tafel] = (perTable[tafel] || 0) + orderTotal;
          }
        });
        setCalcProgress({ done: Math.min(start + batchSize - 1, maxId), total: maxId });
      }

      setAllTimeRevenue(total);
      setDailyRevenue(
        Object.entries(perDay)
          .map(([date, omzet]) => ({ date, omzet }))
          .sort((a, b) => (a.date < b.date ? 1 : -1))
      );
      setTopTables(
        Object.entries(perTable)
          .map(([tafelId, omzet]) => ({ tafelId, omzet }))
          .sort((a, b) => b.omzet - a.omzet)
          .slice(0, TOP_TABLES_COUNT)
      );
    } catch (error) {
      console.error('Error calculating all-time revenue:', error);
      setError('Kon de totale omzet niet berekenen.');
    } finally {
      setCalculating(false);
    }
  };

  // The orderline's "vakjes" field is the euro total for the whole order (same value
  // repeated on every line of that order), so price must be counted once per order_id.
  const orderTotals = orderLines.reduce((acc, line) => {
    acc[line.order_id] = line.vakjes || 0;
    return acc;
  }, {});

  const activeRevenue = Object.values(orderTotals).reduce((sum, total) => sum + total, 0);

  return (
    <div className="container-product">
      <NavBar className="navbar-product" />
      <h2 className="h2-product">Financieel</h2>

      {loading && <p>Laden...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && (
        <>
          <div className="stats-grid-product">
            <div className="stat-card-product">
              <span className="stat-value-product">{activeRevenue}€</span>
              <span className="stat-label-product">Actieve omzet</span>
            </div>
            <div className="stat-card-product">
              <span className="stat-value-product">
                {calculating ? '...' : allTimeRevenue !== null ? `${allTimeRevenue}€` : '-'}
              </span>
              <span className="stat-label-product">Totale omzet</span>
            </div>
          </div>

          <div className="alltime-revenue-product">
            <button className="button-product" onClick={calculateAllTimeRevenue} disabled={calculating}>
              {calculating ? 'Bezig...' : 'Herbereken totale omzet'}
            </button>
            {calculating && (
              <p className="progress-text-product">
                {calcProgress.done} / {calcProgress.total} bestellingen verwerkt
              </p>
            )}
          </div>

          <h3 className="h3-product">Omzet per dag</h3>
          {dailyRevenue.length === 0 ? (
            <p className="p-product empty-product">Nog geen gegevens berekend.</p>
          ) : (
            <div className="table-wrapper-product">
              <table className="data-table-product">
                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>Omzet</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRevenue.map((day) => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.omzet}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="h3-product">Top {TOP_TABLES_COUNT} tafels</h3>
          {topTables.length === 0 ? (
            <p className="p-product empty-product">Nog geen gegevens berekend.</p>
          ) : (
            <div className="table-wrapper-product">
              <table className="data-table-product">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tafel</th>
                    <th>Omzet</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {topTables.map((table, index) => (
                    <tr key={table.tafelId}>
                      <td>{index + 1}</td>
                      <td>{table.tafelId}</td>
                      <td>{table.omzet}€</td>
                      <td>
                        <button className="button-product" onClick={() => history.push(`/tafel/${table.tafelId}`)}>
                          Geschiedenis
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FinancialScreen;
