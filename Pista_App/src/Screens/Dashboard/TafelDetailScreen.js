import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import '../../styles/tafelDetailScreen.css';

function TafelDetailScreen() {
  const history = useHistory();
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/allOrders/${id}`);
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Kon de geschiedenis van deze tafel niet ophalen.');
    } finally {
      setLoading(false);
    }
  }

  const navigateBack = () => {
    history.push('/GetProducts');
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      history.push(`/tafel/${searchValue.trim()}`);
      setSearchValue('');
    }
  }

  // Function to calculate the total price of an order
  const calculateOrderTotal = (order) => {
    let total = 0;
    order.orderlines.forEach(orderline => {
      total += orderline.product_prijs * orderline.hoeveelheid;
    });
    return total;
  }

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('nl-BE', {
      timeZone: 'Europe/Brussels',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(b.creation) - new Date(a.creation));
  const grandTotal = orders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);

  return (
    <div className="tafel-detail-container" translate="no">
      <header className="header-table">
        <h1>Tafel {id} - Geschiedenis</h1>
        <form className="search-form-table" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ga naar tafel..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="search-input-table"
          />
          <button type="submit" className="search-button-table">Zoek</button>
        </form>
      </header>
      <div className="content-body-table">
        {loading && <p>Laden...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            <div className="summary-table">
              <span>{orders.length} bestelling{orders.length !== 1 ? 'en' : ''}</span>
              <span>Totaal: {grandTotal}€</span>
            </div>

            {orders.length === 0 ? (
              <p className="empty-table">Geen bestellingen gevonden voor deze tafel.</p>
            ) : (
              <div className="order-list-table">
                {sortedOrders.map(order => (
                  <div key={order.id} className="order-container-table">
                    <h2>Order ID: {order.id} <span className="order-date-table">{formatDate(order.creation)}</span></h2>
                    <table className="orderline-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Hoeveelheid</th>
                          <th>Prijs</th>
                          <th>Saus</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderlines.map(orderline => (
                          <tr key={orderline.id} className="orderline-row">
                            <td>{orderline.product_naam}</td>
                            <td>{orderline.hoeveelheid}</td>
                            <td>{orderline.product_prijs}€</td>
                            <td>{orderline.saus || '-'}</td>
                            <td>{orderline.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p>Totaal: {calculateOrderTotal(order)}€ - {calculateOrderTotal(order) * 2} vakjes</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <button className="back-button-table" onClick={() => navigateBack()}>Terug naar admin</button>
      </div>
    </div>
  );
}

export default TafelDetailScreen;
