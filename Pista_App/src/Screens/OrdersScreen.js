import React, { useEffect, useState } from 'react';

function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('food');

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://192.168.11.236:3000/api/orders');
      const data = await response.json();
      setOrders(data);
      console.log(data)
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const markOrderLineAsCompleted = async (orderId, orderLineId) => {
    try {
      const response = await fetch(`http://192.168.11.236:3000/api/orderlijnen/${orderLineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 1
        })
      });

      if (response.ok) {
        // Remove the order line from the state
        setOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                orderlines: order.orderlines.filter(orderline => orderline.id !== orderLineId)
              };
            }
            return order;
          });
          return updatedOrders;
        });
        //calculateTotalPrice();
      } else {
        console.error('Error updating order line status');
      }
    } catch (error) {
      console.error('Error updating order line:', error);
    }
  };

  const calculateTotalPrice = (orderlines) => {
    return orderlines.reduce((total, orderline) => {
      return total + orderline.hoeveelheid * orderline.product_prijs;
    }, 0);
  };

  const filteredOrders = orders.filter(order => {
    // Filter out orders with all order lines having status 1
    return order.orderlines.some(orderline => orderline.status === 0);
  });

  const filteredOrdersByCategory = filteredOrders.filter(order => {
    if (selectedCategory === 'food') {
      return order.orderlines.some(orderline => orderline.saus !== "/" && orderline.status === 0);
    } else if (selectedCategory === 'drinks') {
      return order.orderlines.some(orderline => orderline.saus === "/" && orderline.status === 0);
    }
    return false;
  });  

  return (
    <div>
      <div>
        <button onClick={() => setSelectedCategory('food')}>Food Orders</button>
        <button onClick={() => setSelectedCategory('drinks')}>Drinks Orders</button>
      </div>
      {selectedCategory === 'food' ? (
        filteredOrdersByCategory.map(order => (
          <div key={order.id}>
            <h2>Order ID: {order.id}</h2>
            <p>Table ID: {order.tafel_id}</p>
            
            {/* Rendering food order lines */}
            <h3>Food:</h3>
            <ul>
              {order.orderlines.filter(orderline => orderline.saus !== "/" && orderline.status === 0).map(orderline => (
                <li key={orderline.id}>
                  Product: {orderline.id} {orderline.product_naam} | Quantity: {orderline.hoeveelheid} | Price: {orderline.product_prijs}
                  {orderline.saus && <span> | Sauce: {orderline.saus}</span>}
                  <button onClick={() => markOrderLineAsCompleted(order.id, orderline.id)}>klaar</button>
                </li>
              ))}
            </ul>
  
            <div>
              <strong>Total Price: {calculateTotalPrice(order.orderlines)}</strong>
            </div>
          </div>
        ))
      ) : (
        filteredOrdersByCategory.map(order => (
          <div key={order.id}>
            <h2>Order ID: {order.id}</h2>
            <p>Table ID: {order.tafel_id}</p>
            
            {/* Rendering drink order lines */}
            <h3>Drinks:</h3>
            <ul>
              {order.orderlines.filter(orderline => orderline.saus === "/" && orderline.status === 0).map(orderline => (
                <li key={orderline.id}>
                  Product: {orderline.id} | {orderline.product_naam} | Quantity: {orderline.hoeveelheid} | Price: {orderline.product_prijs}
                  <button onClick={() => markOrderLineAsCompleted(order.id, orderline.id)}>klaar</button>
                </li>
              ))}
            </ul>
  
            <div>
              <strong>Total Price: {calculateTotalPrice(order.orderlines)}</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
  
}

export default OrdersScreen;
