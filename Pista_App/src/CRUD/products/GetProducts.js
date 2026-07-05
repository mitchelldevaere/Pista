import React, { useState, useEffect } from "react";
import NavBar from "../../Util/NavBar";
import { useHistory } from 'react-router-dom';
import "../../styles/getProduct.css"

const ProductList = () => {
  const history = useHistory();

  const [products, setProducts] = useState([]);
  const [orderLines, setOrderLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableSearch, setTableSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await fetch("https://lapista.depistezulte.be/api/producten");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

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

const goToTable = (tafelId) => {
  history.push(`/tafel/${tafelId}`);
}

const handleTableSearch = (e) => {
  e.preventDefault();
  if (tableSearch.trim()) {
    goToTable(tableSearch.trim());
    setTableSearch('');
  }
}

useEffect(() => {
  Promise.all([fetchProducts(), fetchOrders()]).finally(() => setLoading(false));

  // Keep the product list and active orders/tables up to date without a manual reload
  const refreshInterval = setInterval(() => {
    fetchProducts();
    fetchOrders();
  }, 60000);

  return () => clearInterval(refreshInterval);
}, []);

// The orderline's "vakjes" field is the euro total for the whole order (same value
// repeated on every line of that order), so price must be counted once per order_id.
const orderTotals = orderLines.reduce((acc, line) => {
  acc[line.order_id] = line.vakjes || 0;
  return acc;
}, {});

// Group the live order lines per table so each table can be looked up independently
const tables = Object.values(
  orderLines.reduce((acc, line) => {
    const tafelId = line.tafel_id;
    if (!acc[tafelId]) {
      acc[tafelId] = { tafelId, orderIds: new Set(), lineCount: 0 };
    }
    acc[tafelId].orderIds.add(line.order_id);
    acc[tafelId].lineCount += 1;
    return acc;
  }, {})
)
  .map((table) => ({
    tafelId: table.tafelId,
    orderCount: table.orderIds.size,
    lineCount: table.lineCount,
    total: [...table.orderIds].reduce((sum, orderId) => sum + orderTotals[orderId], 0),
  }))
  .sort((a, b) => a.tafelId - b.tafelId);

return (
  <div className="container-product">
    <NavBar className="navbar-product" />
    <h2 className="h2-product">Admin</h2>

    {loading && <p>Laden...</p>}
    {error && <p className="error-message">{error}</p>}

    {!loading && (
      <>
        <div className="stats-grid-product">
          <div className="stat-card-product">
            <span className="stat-value-product">{products.length}</span>
            <span className="stat-label-product">Producten</span>
          </div>
          <div className="stat-card-product">
            <span className="stat-value-product">{tables.length}</span>
            <span className="stat-label-product">Actieve tafels</span>
          </div>
          <div className="stat-card-product">
            <span className="stat-value-product">{orderLines.length}</span>
            <span className="stat-label-product">Actieve orderlijnen</span>
          </div>
        </div>

        <h3 className="h3-product">Tafel geschiedenis opzoeken</h3>
        <form className="table-search-form-product" onSubmit={handleTableSearch}>
          <input
            type="text"
            placeholder="Tafelnummer of code (bv. S222)"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="table-search-input-product"
          />
          <button type="submit" className="button-product">Bekijk geschiedenis</button>
        </form>

        <h3 className="h3-product">Actieve tafels</h3>
        {tables.length === 0 ? (
          <p className="p-product empty-product">Geen actieve bestellingen.</p>
        ) : (
          <div className="table-wrapper-product">
            <table className="data-table-product">
              <thead>
                <tr>
                  <th>Tafel</th>
                  <th>Bestellingen</th>
                  <th>Orderlijnen</th>
                  <th>Totaal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr key={table.tafelId}>
                    <td>{table.tafelId}</td>
                    <td>{table.orderCount}</td>
                    <td>{table.lineCount}</td>
                    <td>{table.total}€</td>
                    <td>
                      <button className="button-product" onClick={() => goToTable(table.tafelId)}>Geschiedenis</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="create-button-product" onClick={() => history.push('/products')}>Bekijk producten</button>
        <button className="create-button-product" onClick={() => history.push('/ordersHistory')}>Bekijk alle bestellingen</button>
        <button className="create-button-product" onClick={() => history.push('/financial')}>Bekijk financieel overzicht</button>
      </>
    )}
  </div>
);
};

export default ProductList;
