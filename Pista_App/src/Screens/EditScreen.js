import React, { useState } from "react";
import {  useHistory } from "react-router-dom";
import "../styles/editScreen.css";

function EditScreen({ location }) {
  
  const history = useHistory();

  const orderlinesProp = location.state?.orderlines || [];
  const id = location.state?.id;

  const [orderlines, setOrderlines] = useState(orderlinesProp);

  const increaseQuantity = (index) => {
    const updatedOrderlines = [...orderlines];
    updatedOrderlines[index].hoeveelheid += 1;
    setOrderlines(updatedOrderlines);
  };

  const decreaseQuantity = (index) => {
    const updatedOrderlines = [...orderlines];
    if (updatedOrderlines[index].hoeveelheid > 1) {
      updatedOrderlines[index].hoeveelheid -= 1;
      setOrderlines(updatedOrderlines);
    }
  };

  const deleteProduct = (index) => {
    const updatedOrderlines = [...orderlines];
    updatedOrderlines.splice(index, 1);
    setOrderlines(updatedOrderlines);
  };

  const calculateTotalPrice = (orderlines) => {
    console.log(orderlines)
    let totalPrice = 0;
    
    orderlines.forEach(orderline => {
      const linePrice = orderline.prijs * orderline.hoeveelheid;
      totalPrice += linePrice;
    });
  
    return totalPrice
  }

  const handleGeefDoor = () => {
    if (orderlinesProp.length !== 0) {

      const now = new Date();
      const currentTimestamp = now.toISOString().replace('T', ' ').substr(0, 19);

      console.log(currentTimestamp)

      const newOrder = {
        tafel_id: id,
        creation: currentTimestamp,
        modification: currentTimestamp
      }

      localStorage.removeItem("orderData");
      postOrder(newOrder)
    } else {
      window.alert("Iets anders")
    }
  };

  const postOrder = async (order) => {
    try {
      // Send the product data to the server
      const response = await fetch("https://lapista.depistezulte.be/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        // Product was successfully created
        GetCurrentOrder()
      } else {
        // Handle error response
        console.error("Failed to create product:", response.statusText);
      }
    } catch (error) {
      // Handle network or other errors
      console.error("An error occurred:", error);
    }
  };

  const GetCurrentOrder = async () => {
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/orders/${id}`);
      const data = await response.json();
      console.log(data)
      postOrderlines(data)
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  }

  const postOrderlines = async (order) => {
    console.log(order);
  
    try {
      const orderLineData = []; // Array to store order line data for localStorage
  
      for (const orderline of orderlines) {
        const newOrderLine = {
          order_id: order.id,
          product_id: orderline.product_id,
          naam: orderline.naam,
          prijs: orderline.prijs,
          hoeveelheid: orderline.hoeveelheid,
          saus: orderline.saus,
          status: orderline.status,
        };
  
        const response = await fetch("https://lapista.depistezulte.be/api/orderlijnen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newOrderLine),
        });
  
        if (!response.ok) {
          console.error("Failed to create order line:", response.statusText);
        }
  
        orderLineData.push(newOrderLine);
      }
  
      console.log(orderLineData);
  
      // Store the order and order lines data in localStorage
      localStorage.setItem("orderData", JSON.stringify({ order, orderlines: orderLineData }));
  
      console.log(localStorage.getItem("orderData"));
      history.push("/succes");
    } catch (error) {
      console.error("An error occurred while uploading order lines:", error);
    }
  };

  const handleReturnToOrderScreen = () => {
    history.push(`/order/${id}`, { orderlines });
  };

  return (
    <div className="edit-container" translate="no">
      <div className="edit-header">
        <h1 className="edit-title">Controleer je bestelling</h1>
        <button className="edit-back-button" onClick={() => handleReturnToOrderScreen()}>Bestel nog iets extra</button>
      </div>
      <div className="edit-content">
        <div className="edit-price">
          <h2>{calculateTotalPrice(orderlines) * 2} vakjes</h2>
        </div>
        <div className="edit-orders">
          {orderlines.map((orderline, index) => (
            <div key={orderline.id} className="edit-ordered-item">
              <div className="edit-item-info">
                {orderline.naam} {orderline.saus === "/" ? null : `- ${orderline.saus}`} - {orderline.hoeveelheid} {orderline.hoeveelheid === 1 ? "stuk" : "stuks"}
              </div>
              <div className="edit-item-quantity">
                <button className="edit-quantity-button" onClick={() => decreaseQuantity(index)}>-</button>
                <button className="edit-quantity-button" onClick={() => increaseQuantity(index)}>+</button>
                <button className="edit-delete-button" onClick={() => deleteProduct(index)}>Verwijder</button>
              </div>
            </div>
          ))}
        </div>
        <div>
          <button className="edit-geef-door-button" onClick={handleGeefDoor}>Geef Door</button>
        </div>
      </div>
    </div>
  );  
}

export default EditScreen;
