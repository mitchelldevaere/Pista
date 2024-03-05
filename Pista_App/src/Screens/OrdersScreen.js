import React, { useEffect, useState } from 'react';
import '../styles/ordersScreen.css';

function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://lapista.depistezulte.be/api/orders');
      const data = await response.json();
      setOrders(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      setError('Error fetching orders. Please try again.');
    }
  };

  const markOrderLineAsCompleted = async (orderLineId) => {
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/orderlijnen/${orderLineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.error('Error updating order line status');
      }
    } catch (error) {
      console.error('Error updating order line:', error);
    }
  };

  const markBarOrdersAsCompleted = async (orderGroup, barNumber) => {
    try {
      const barOrders = orderGroup.orderLines.filter((order) => order.bar === barNumber);
      for (const order of barOrders) {
        await markOrderLineAsCompleted(order.orderline_id);
      }
    } catch (error) {
      console.error(`Error marking Bar ${barNumber} orders as completed:`, error);
    }
  };

  const groupOrders = (orderLines) => {
    const groupedOrders = {};

    orderLines.forEach(orderLine => {
      const orderId = orderLine.order_id;
      const tafelId = orderLine.tafel_id;
      const prijs = orderLine.prijs;

      const key = `${orderId}-${tafelId}`;
      if (!groupedOrders[key]) {
        groupedOrders[key] = {
          orderId,
          tafelId,
          prijs,
          orderLines: [],
        };
      }

      groupedOrders[key].orderLines.push(orderLine);
    });

    return Object.values(groupedOrders);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Tafel</th>
              <th>Vakjes</th>
              <th>Bar 1 Orders</th>
              <th>Bar 1</th>
              <th>Bar 2 Orders</th>
              <th>Bar 2</th>
              <th>Bar 3 Orders</th>
              <th>Bar 3</th>
            </tr>
          </thead>
          <tbody>
            {groupOrders(orders)
              .sort((a, b) => a.orderId - b.orderId)
              .map((groupedOrder) => (
                <tr key={`${groupedOrder.orderId}-${groupedOrder.tafelId}`}>
                  <td>{groupedOrder.orderId}</td>
                  <td>{groupedOrder.tafelId}</td>
                  <td>{groupedOrder.prijs}</td>
                  <td>
                    {groupedOrder.orderLines
                      .filter((order) => order.bar === 1)
                      .map((order) => (
                        <p key={order.orderline_id}>
                          {order.hoeveelheid} x {order.naam}
                          {order.saus !== "/" && ` - ${order.saus}`}
                        </p>
                      ))}
                  </td>
                  <td>
                    <button
                      className="klaar-button-orders"
                      onClick={() => markBarOrdersAsCompleted(groupedOrder, 1)}
                    >
                      OK 1
                    </button>
                  </td>
                  <td>
                    {groupedOrder.orderLines
                      .filter((order) => order.bar === 2)
                      .map((order) => (
                        <p key={order.orderline_id}>
                          {order.hoeveelheid} x {order.naam}
                        </p>
                      ))}
                  </td>
                  <td>
                    <button
                      className="klaar-button-orders"
                      onClick={() => markBarOrdersAsCompleted(groupedOrder, 2)}
                    >
                      OK 2
                    </button>
                  </td>
                  <td>
                    {groupedOrder.orderLines
                      .filter((order) => order.bar === 3)
                      .map((order) => (
                        <p key={order.orderline_id}>
                          {order.hoeveelheid} x {order.naam}
                          {order.saus !== "/" && ` - ${order.saus}`}
                        </p>
                      ))}
                  </td>
                  <td>
                    <button
                      className="klaar-button-orders"
                      onClick={() => markBarOrdersAsCompleted(groupedOrder, 3)}
                    >
                      OK 3
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrdersScreen;
