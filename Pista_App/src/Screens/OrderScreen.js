import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";

function OrderScreen() {
  const history = useHistory();

  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [sauces, setSauces] = useState([])
  const [orderlines, setOrderlines] = useState([]);

  const [total, setTotal] = useState(0);
  const [drinkQuantity, setDrinkQuantity] = useState(0);
  const [foodQuantity, setFoodQuantity] = useState(0);


  const [selectedSauces, setSelectedSauces] = useState({});

  const [collapsedCategories, setCollapsedCategories] = useState({
    food: true,
    frisdrank: true,
    bier: true,
    wijn: true,
    champagne: true,
    cocktail: true,
  });


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://192.168.11.236:3000/api/producten`);
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
      const sauceResponse = await fetch(`http://192.168.11.236:3000/api/sauzen`);
      const sauceData = await sauceResponse.json();
      setSauces(sauceData); // Store sauce data in a state variable
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  const increaseDrinks = (productId) => {
    const productToUpdate = products.find((product) => product.id === productId);
  
    // Check if an order line with the same product ID and name exists
    const existingOrderLineIndex = orderlines.findIndex(
      (orderline) =>
        orderline.product_id === productId && orderline.naam === productToUpdate.naam && orderline.saus === "/"
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
        saus: "/",
        status: 0
      };
      setOrderlines((prevOrderlines) => [...prevOrderlines, newOrderLine]);
    }
    setDrinkQuantity((prevQuantity) => prevQuantity + 1);
  };

  const showDropDown = (productId) => {
    const productToUpdate = products.find((product) => product.id === productId);
  
    setSelectedSauces((prevSelectedSauces) => {
      const newSelectedSauces = { ...prevSelectedSauces };
  
      // If the dropdown is already visible, hide it
      if (newSelectedSauces[productId] === productToUpdate.sauzen[0].saus) {
        delete newSelectedSauces[productId];
      } else {
        // Show the dropdown for the clicked product
        newSelectedSauces[productId] = productToUpdate.sauzen[0].saus; // Set default sauce
      }
  
      return newSelectedSauces;
    });
  };

  const handleSauceChange = (productId, selectedSauce) => {
    setSelectedSauces((prevSelectedSauces) => ({
      ...prevSelectedSauces,
      [productId]: selectedSauce,
    }));
  };

  const increaseFood = (productId) => {
    const selectedSauce = selectedSauces[productId];

    if (selectedSauce) {
      const productToUpdate = products.find((product) => product.id === productId);
      const existingOrderLineIndex = orderlines.findIndex(
        (orderline) =>
          orderline.product_id === productId &&
          orderline.naam === productToUpdate.naam &&
          orderline.saus === selectedSauce
      );

      if (existingOrderLineIndex !== -1) {
        const updatedOrderlines = [...orderlines];
        updatedOrderlines[existingOrderLineIndex].hoeveelheid += 1;
        setOrderlines(updatedOrderlines);
      } else {
        const newOrderLine = {
          order_id: id,
          product_id: productId,
          naam: productToUpdate.naam,
          prijs: productToUpdate.prijs,
          hoeveelheid: 1,
          saus: selectedSauce,
        };
        setOrderlines((prevOrderlines) => [...prevOrderlines, newOrderLine]);
      }
      setSelectedSauces((prevSelectedSauces) => ({
        ...prevSelectedSauces,
        [productId]: "",
      }));
    }
    setFoodQuantity((prevQuantity) => prevQuantity + 1);
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
    const newTotal = orderlines.reduce((acc, orderline) => {
      const sauce = sauces.find((sauce) => sauce.saus === orderline.saus);
      const saucePrice = sauce ? sauce.prijs : 0;
  
      return acc + (orderline.hoeveelheid * orderline.prijs) + (orderline.hoeveelheid * saucePrice);
    }, 0);
  
    const newDrinkQuantity = orderlines.reduce((acc, orderline) => {
      if (orderline.saus === "/") {
        return acc + orderline.hoeveelheid;
      }
      return acc;
    }, 0);
  
    const newFoodQuantity = orderlines.reduce((acc, orderline) => {
      if (orderline.saus !== "/") {
        return acc + orderline.hoeveelheid;
      }
      return acc;
    }, 0);
  
    setTotal(newTotal);
    setDrinkQuantity(newDrinkQuantity);
    setFoodQuantity(newFoodQuantity);
  }, [orderlines, sauces]);
  



  const handleGeefDoor = () => {
    if(orderlines.length !== 0){
      history.push("/");

      const now = new Date();
      const currentTimestamp = now.toISOString().replace('T', ' ').substr(0, 19);

      console.log(currentTimestamp)

      const newOrder = {
        tafel_id: id, 
        creation: currentTimestamp,
        modification: currentTimestamp,
        status: 0
      }
    
    postOrder(newOrder)
    } else {
      window.alert("kies een item")
    }
  }; 

  const postOrder = async (order) => {
      try {
       // Send the product data to the server
       const response = await fetch("http://192.168.11.236:3000/api/orders", {
         method: "POST",
         headers: {
           "Content-Type": "application/json"
         },
         body: JSON.stringify(order)
       });

       if (response.ok) {
         // Product was successfully created
         uploadOrderLines()
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
    try {
      const response = await fetch(`http://192.168.11.236:3000/api/orders/${id}`);
      const data = await response.json();
      console.log(data)
      postOrderlines(data)
    } catch (error) {
      console.error("Error fetching order:", error);
    }
  }

  const postOrderlines = async (order) => {
    console.log(order)

    try {
      for (const orderline of orderlines) {
        const newOrderLine = {
          order_id: order.id,
          product_id: orderline.product_id,
          naam: orderline.naam,
          prijs: orderline.prijs,
          hoeveelheid: orderline.hoeveelheid,
          saus: orderline.saus
        };

        console.log(newOrderLine)

        const response = await fetch("http://192.168.11.236:3000/api/orderlijnen", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newOrderLine),
        });

        if (!response.ok) {
          console.error("Failed to create order line:", response.statusText);
        }
      }
      console.log("Order lines uploaded successfully!");
    } catch (error) {
      console.error("An error occurred while uploading order lines:", error);
    }
  }

  const toggleCollapse = (category) => {
    setCollapsedCategories((prevState) => ({
      ...Object.keys(prevState).reduce((acc, curr) => {
        acc[curr] = curr === category ? !prevState[curr] : true;
        return acc;
      }, {})
    }));
  };
  

  // Split products into two arrays based on "soort"
  const foodProducts = products.filter((product) => product.soort === "eten");
  const frisdrankProducts = products.filter((product) => product.soort === "frisdrank");
  const bierProducts = products.filter((product) => product.soort === "bier");
  const wijnProducts = products.filter((product) => product.soort === "wijn");
  const champagneProducts = products.filter((product) => product.soort === "champagne");
  const cocktailProducts = products.filter((product) => product.soort === "cocktail");

  return (
    <div>
      <h1>Tafel {id}</h1>
        <div>
          <div>
          <h2 onClick={() => toggleCollapse('food')}>Eten</h2>
          {!collapsedCategories.food && (
            <ul>
              {foodProducts.map((product) => (
                <li key={product.id}>
                  <p>
                    {product.naam} - {product.prijs}€{" "}
                    <button onClick={() => showDropDown(product.id)}>+</button>{" "}
                    {selectedSauces[product.id] && (
                      <React.Fragment>
                        <select
                          value={selectedSauces[product.id]}
                          onChange={(event) => handleSauceChange(product.id, event.target.value)}
                        >
                          {product.sauzen.map((saus) => (
                            <option key={saus.id} value={saus.saus}>
                              {saus.saus}
                            </option>
                          ))}
                        </select>{" "}
                        <button onClick={() => increaseFood(product.id)}>Voeg toe</button>
                      </React.Fragment>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
        <h2 onClick={() => toggleCollapse('frisdrank')}>Frisdrank</h2>
        {!collapsedCategories.frisdrank && (
          <ul>
            {frisdrankProducts.map((product) => (
              <li key={product.id}>
                <p>
                {product.naam} - {product.prijs}{"€ "}
                  <button onClick={() => increaseDrinks(product.id)}>+</button>{"   "}
                </p>
              </li>
            ))}
          </ul>
        )}
        </div>
        <div>
        <h2 onClick={() => toggleCollapse('bier')}>Bier</h2>
        {!collapsedCategories.bier && (
          <ul>
            {bierProducts.map((product) => (
              <li key={product.id}>
                <p>
                {product.naam} - {product.prijs}{"€ "}
                  <button onClick={() => increaseDrinks(product.id)}>+</button>{"   "}
                </p>
              </li>
            ))}
          </ul>
        )}
        </div>
        <div>
        <h2 onClick={() => toggleCollapse('wijn')}>Wijn</h2>
        {!collapsedCategories.wijn && (
          <ul>
            {wijnProducts.map((product) => (
              <li key={product.id}>
                <p>
                {product.naam} - {product.prijs}{"€ "}
                  <button onClick={() => increaseDrinks(product.id)}>+</button>{"   "}
                </p>
              </li>
            ))}
          </ul>
        )}
        </div>
        <div>
        <h2 onClick={() => toggleCollapse('champagne')}>Champagne</h2>
        {!collapsedCategories.champagne && (
          <ul>
            {champagneProducts.map((product) => (
              <li key={product.id}>
                <p>
                {product.naam} - {product.prijs}{"€ "}
                  <button onClick={() => increaseDrinks(product.id)}>+</button>{"   "}
                </p>
              </li>
            ))}
          </ul>
        )}
        </div>
        <div>
        <h2 onClick={() => toggleCollapse('cocktail')}>Cocktail</h2>
        {!collapsedCategories.cocktail && (
          <ul>
            {cocktailProducts.map((product) => (
              <li key={product.id}>
                <p>
                {product.naam} - {product.prijs}{"€ "}
                  <button onClick={() => increaseDrinks(product.id)}>+</button>{"   "}
                </p>
              </li>
            ))}
          </ul>
        )}
        </div>
        <p>Total: {total.toFixed(2)} {'€'} - Drinks: {drinkQuantity} - Food: {foodQuantity}</p>
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
