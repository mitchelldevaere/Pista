// EditScreen.js

import React, { useState } from "react";

import { useParams, useHistory } from "react-router-dom";

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

  return (
    <div>
      <h1>Edit Screen</h1>
      {/* Display or edit orderlines as needed */}
      <ul>
        {orderlines.map((orderline, index) => (
          <li key={orderline.id}>
            {orderline.naam} - {orderline.hoeveelheid} stuks
            <button onClick={() => increaseQuantity(index)}>Increase</button>
            <button onClick={() => decreaseQuantity(index)}>Decrease</button>
          </li>
        ))}
      </ul>
      <div>
      <button className="geef-door-button-order" onClick={handleGeefDoor}>
        </button>
      </div>
    </div>
  );
}

export default EditScreen;
