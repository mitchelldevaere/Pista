import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

function OrderScreen() {
  const history = useHistory();

  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [sauces, setSauces] = useState([])
  const [orderlines, setOrderlines] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/producten`);
      const data = await response.json();
      const products= data.map((product) => ({
        ...product,
        selectedSaus: ""
      }));
      setProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    try {
      const sauceResponse = await fetch(`http://localhost:5000/api/sauzen`);
      const sauceData = await sauceResponse.json();
      setSauces(sauceData); // Store sauce data in a state variable
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  const increase = (productId) => {
    const productToUpdate = products.find((product) => product.id === productId);
  
    // Check if an order line with the same product ID and name exists
    const existingOrderLineIndex = orderlines.findIndex(
      (orderline) =>
        orderline.product_id === productId && orderline.naam === productToUpdate.naam && orderline.saus === productToUpdate.selectedSaus
    );

    if (existingOrderLineIndex !== -1) {
      // Increase the quantity of the existing order line
      const updatedOrderlines = [...orderlines];
      updatedOrderlines[existingOrderLineIndex].hoeveelheid += 1;
      setOrderlines(updatedOrderlines);
    } else {
      // Create a new order line
      const newOrderLine = {
        order_id: id,
        product_id: productId,
        naam: productToUpdate.naam,
        prijs: productToUpdate.prijs,
        hoeveelheid: 1,
        saus: productToUpdate.selectedSaus || "", // Use selectedSaus or an empty string
        status: 0,
      };
      setOrderlines((prevOrderlines) => [...prevOrderlines, newOrderLine]);
    }
  };


  const decrease = (orderlineIndex) => {
    const updatedOrderlines = [...orderlines];
    const orderlineToUpdate = updatedOrderlines[orderlineIndex];
  
    if (orderlineToUpdate.hoeveelheid > 1) {
      orderlineToUpdate.hoeveelheid -= 1;
    } else {
      updatedOrderlines.splice(orderlineIndex, 1); // Remove the orderline if quantity is 1
    }
  
    setOrderlines(updatedOrderlines);
  };
  

  useEffect(() => {
      // Calculate total price based on selected products and their quantities
      const newTotal = orderlines.reduce((acc, orderline) => {
      // Find the corresponding sauce for the orderline
      const sauce = sauces.find((sauce) => sauce.saus === orderline.saus);
      const saucePrice = sauce ? sauce.prijs : 0;
      
      return acc + (orderline.hoeveelheid * orderline.prijs) + (orderline.hoeveelheid * saucePrice);
    }, 0);
  
    setTotal(newTotal);
  }, [orderlines, sauces]);

  const handleGeefDoor = () => {
    history.push("/");

    const now = new Date();
    const currentTimestamp = now.toISOString().replace('T', ' ').substr(0, 19);

    console.log(currentTimestamp)

    const newOrder = {
      tafel_id: id, 
      creation: currentTimestamp,
      modification: currentTimestamp
    }
    
    uploadOrder(newOrder)

    uploadOrderLines()
  }; 

  const uploadOrder = async (order) => {
    console.log(order)

      try {
       // Send the product data to the server
       const response = await fetch("http://localhost:5000/api/orders", {
         method: "POST",
         headers: {
           "Content-Type": "application/json"
         },
         body: JSON.stringify(order)
       });

       if (response.ok) {
         // Product was successfully created
         // Navigate to a different route (e.g., a success page)
         history.push("/");
       } else {
         // Handle error response
         console.error("Failed to create product:", response.statusText);
       }
     } catch (error) {
       // Handle network or other errors
       console.error("An error occurred:", error);
     }
  };

  const uploadOrderLines = async () => {
    console.log(orderlines)
  }

  // Split products into two arrays based on "soort"
  const foodProducts = products.filter((product) => product.soort === "eten");
  const drinkProducts = products.filter((product) => product.soort === "drank");

  return (
    <div>
      <h1>Tafel {id}</h1>
      <div>
      <div>
          <h2>Eten</h2>
          <ul>
            {foodProducts.map((product) => (
              <li key={product.id}>
                <p>
                  {product.naam} - {product.prijs}{"€ "}
                  <button onClick={() => increase(product.id)}>+</button>{"   "}
                  {product.sauzen && product.sauzen.length > 0 && (
                    <select
                      value={product.selectedSaus}
                      onChange={(event) => {
                        const updatedProducts = products.map((p) =>
                          p.id === product.id ? { ...p, selectedSaus: event.target.value } : p
                        );
                        setProducts(updatedProducts);
                      }}
                    >
                      <option value="">Geen saus</option>
                      {product.sauzen.map((saus) => (
                        <option key={saus.id} value={saus.saus}>
                          {saus.saus}
                        </option>
                      ))}
                  </select>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Drinken</h2>
          <ul>
            {drinkProducts.map((product) => (
              <li key={product.id}>
                <p>
                {product.naam} - {product.prijs}{"€ "}
                  <button onClick={() => increase(product.id)}>+</button>{"   "}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <p>Total: {total.toFixed(2)} {'€'}</p>
        <button onClick={handleGeefDoor}>geef door</button>
      </div>
      <div>
        <h2>bestelde producten</h2>
        <ul>
          {orderlines.map((orderline, index) => (
            <li key={orderline.id}>
              <p>
                {orderline.naam} - {orderline.hoeveelheid}
                {orderline.saus && ` - ${orderline.saus}`}
                <button onClick={() => decrease(index)}>-</button>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default OrderScreen;
