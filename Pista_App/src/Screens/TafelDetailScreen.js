import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';

function TafelDetailScreen() {
  const { id } = useParams();

  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://192.168.11.236:3000/api/allOrders/${id}`);
      const data = await response.json();
      setOrders(data);
      console.log(data)
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }

  return (
    <div>
      {orders.map(order => (
        <div key={order.id}>
          <h2>Order ID: {order.id}</h2>
          <p>Table ID: {order.tafel_id}</p>
          <ul>
            {order.orderlines.map(orderline => (
              <li key={orderline.id}>
                Product: {orderline.product_naam} | Quantity: {orderline.hoeveelheid} | Price: {orderline.product_prijs}
                {orderline.saus && orderline.saus !== '/' && (
                  <span> | Sauce: {orderline.saus}</span>
                )} | Status: {orderline.status}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default TafelDetailScreen;
