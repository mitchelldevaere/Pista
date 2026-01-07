import React, { useEffect, useState } from 'react';
import useSound from 'use-sound';
import '../../styles/ordersScreen.css';
import order from '../../sound/Order.mp3'

function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkboxStates, setCheckboxStates] = useState({});

  const [playSound] = useSound(order);

  useEffect(() => {    
    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
  });

  const fetchData = async () => {
    try {
      const response = await fetch('https://lapista.depistezulte.be/api/ordersBar3');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      initializeCheckboxStates(data);
      setLoading(false);
      setError(null);

      if(orders.length !== data.length)
        {
          playSound()
        }

    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
      setError('Error fetching orders. Please try again.');
    }
  };

  const initializeCheckboxStates = (data) => {
    const newCheckboxStates = {};
    data.forEach(orderLine => {
      newCheckboxStates[`${orderLine.orderline_id}-bereiding`] = orderLine.bereiding === 1;
    });
    setCheckboxStates(prevState => ({
      ...prevState,
      ...newCheckboxStates
    }));
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
        throw new Error('Error updating order line status');
      } else {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating order line:', error);
    }
  };

  const putBereiding = async (orderLineId) => {
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/orderlijnenBereiding/${orderLineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Error updating order line status');
      } else {
        fetchData();
      }
    } catch (error) {
      console.error('Error updating order line:', error);
    }
  };

  const groupOrders = (orderLines) => {
    const groupedOrders = {};

    orderLines.forEach(orderLine => {
      if (orderLine.bar !== 3) return; // Skip if not Bar 3
      const orderId = orderLine.order_id;
      const tafelId = orderLine.tafel_id;
      const vakjes = orderLine.vakjes;

      const key = `${orderId}-${tafelId}`;
      if (!groupedOrders[key]) {
        groupedOrders[key] = {
          orderId,
          tafelId,
          vakjes,
          orderLines: [],
        };
      }

      groupedOrders[key].orderLines.push(orderLine);
    });

    return Object.values(groupedOrders);
  };

  const handleBereidingChange = (orderLineId) => {
    putBereiding(orderLineId);
    setCheckboxStates(prevState => ({
      ...prevState,
      [`${orderLineId}-bereiding`]: !prevState[`${orderLineId}-bereiding`],
    }));
  };

  const handleKlaarChange = (orderLineId) => {
    setCheckboxStates(prevState => ({
      ...prevState,
      [`${orderLineId}-klaar`]: !prevState[`${orderLineId}-klaar`],
    }));
  };

  const isOkDisabled = (orderLineId) => {
    return !checkboxStates[`${orderLineId}-bereiding`] || !checkboxStates[`${orderLineId}-klaar`];
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
              <th>Item</th>
              <th>Hoeveelheid</th>
              <th>Saus</th>
              <th>Bereiding</th>
              <th>Klaar</th>
              <th>Bar 3</th>
            </tr>
          </thead>
          <tbody>
            {groupOrders(orders)
              .sort((a, b) => a.orderId - b.orderId)
              .map(groupedOrder => {
                const { orderId, tafelId, vakjes, orderLines } = groupedOrder;

                return orderLines.map(order => (
                  <tr key={order.orderline_id}>
                    <td>{orderId}</td>
                    <td>{tafelId}</td>
                    <td>{vakjes}</td>
                    <td>{order.naam}</td>
                    <td>{order.hoeveelheid}</td>
                    <td>{order.saus !== "/" ? order.saus : ""}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkboxStates[`${order.orderline_id}-bereiding`] || false}
                        onChange={() => handleBereidingChange(order.orderline_id)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={checkboxStates[`${order.orderline_id}-klaar`] || false}
                        onChange={() => handleKlaarChange(order.orderline_id)}
                        disabled={!checkboxStates[`${order.orderline_id}-bereiding`]}
                      />
                    </td>
                    <td>
                      <button
                        className="klaar-button-orders"
                        onClick={() => markOrderLineAsCompleted(order.orderline_id)}
                        disabled={isOkDisabled(order.orderline_id)}
                      >
                        OK 3
                      </button>
                    </td>
                  </tr>
                ));
              })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrdersScreen;
