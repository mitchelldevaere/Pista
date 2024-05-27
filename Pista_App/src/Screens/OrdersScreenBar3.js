import React, { useEffect, useState } from 'react';
import '../styles/ordersScreen.css';

function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkboxStates, setCheckboxStates] = useState({});

  useEffect(() => {
    const storedCheckboxStates = JSON.parse(localStorage.getItem('checkboxStates')) || {};
    setCheckboxStates(storedCheckboxStates);
    
    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    localStorage.setItem('checkboxStates', JSON.stringify(checkboxStates));
  }, [checkboxStates]);

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
      } else {
        fetchData();
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
      if (orderLine.bar !== 3) return; // Skip if not Bar 3
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

  const handleBereidingChange = (orderId, tafelId) => {
    setCheckboxStates(prevState => ({
      ...prevState,
      [`${orderId}-${tafelId}-bereiding`]: !prevState[`${orderId}-${tafelId}-bereiding`],
    }));
  };

  const handleKlaarChange = (orderId, tafelId) => {
    setCheckboxStates(prevState => ({
      ...prevState,
      [`${orderId}-${tafelId}-klaar`]: !prevState[`${orderId}-${tafelId}-klaar`],
    }));
  };

  const isOkDisabled = (orderId, tafelId) => {
    return !checkboxStates[`${orderId}-${tafelId}-bereiding`] || !checkboxStates[`${orderId}-${tafelId}-klaar`];
  };

  return (
    <div translate="no">
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Tafel</th>
              <th>Vakjes</th>
              <th>Bereiding</th>
              <th>Klaar</th>
              <th>Bar 3 Orders</th>
              <th>Bar 3</th>
            </tr>
          </thead>
          <tbody>
            {groupOrders(orders)
             .sort((a, b) => a.orderId - b.orderId)
             .filter(groupedOrder => groupedOrder.orderLines.some(order => order.bar === 3))
             .map((groupedOrder) => {
                const orderId = groupedOrder.orderId;
                const tafelId = groupedOrder.tafelId;
  
                return (
                  <tr key={`${orderId}-${tafelId}`}>
                    <td>{orderId}</td>
                    <td>{tafelId}</td>
                    <td>{groupedOrder.prijs}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkboxStates[`${orderId}-${tafelId}-bereiding`] || false}
                        onChange={() => handleBereidingChange(orderId, tafelId)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkboxStates[`${orderId}-${tafelId}-klaar`] || false}
                        onChange={() => handleKlaarChange(orderId, tafelId)}
                        disabled={!checkboxStates[`${orderId}-${tafelId}-bereiding`]}
                      />
                    </td>
                    <td>
                      {groupedOrder.orderLines
                       .map((order) => (
                          <p key={order.orderline_id}>
                            {order.hoeveelheid} x {order.naam}
                            {order.saus!== "/" && ` - ${order.saus}`}
                          </p>
                        ))}
                    </td>
                    <td>
                      <button
                        className="klaar-button-orders"
                        onClick={() => markBarOrdersAsCompleted(groupedOrder, 3)}
                        disabled={isOkDisabled(orderId, tafelId)}
                      >
                        OK 3
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrdersScreen;
