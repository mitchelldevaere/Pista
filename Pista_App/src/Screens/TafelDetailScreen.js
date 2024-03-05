import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import '../styles/tafelDetailScreen.css';

function TafelDetailScreen() {
  const history = useHistory();
  const { id } = useParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/allOrders/${id}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  const navigateBack = () => {
    history.push('/');
  }

  // Function to calculate the total price of an order
  const calculateOrderTotal = (order) => {
    let total = 0;
    order.orderlines.forEach(orderline => {
      total += orderline.product_prijs * orderline.hoeveelheid;
    });
    return total;
  }

  return (
    <div className="tafel-detail-container" translate="no">
      <header className="header-table">
        <h1>Table ID: {id}</h1>
      </header>
      <div className="content-body-table">
        <div className="order-list-table">
          {orders.map(order => (
            <div key={order.id} className="order-container-table">
              <h2>Order ID: {order.id}</h2>
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
        <button className="back-button-table" onClick={() => navigateBack()}>Home</button>
      </div>
    </div>
  );
}

export default TafelDetailScreen;
