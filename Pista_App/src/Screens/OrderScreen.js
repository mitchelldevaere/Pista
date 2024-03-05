import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import "../styles/orderScreen.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/free-solid-svg-icons";

import ImagePopup from "../Util/Popup";

import image1 from "../images/burger.jpg";
import image2 from "../images/veggie.jpg";
import image3 from "../images/pasta.jpg";
import image4 from "../images/frietjes.jpg";
import image5 from "../images/tapasbord.jpg";
import image6 from "../images/aperomix.jpg";
import image7 from "../images/croque.jpg";
import image8 from "../images/pannenkoek.jpg";
import image9 from "../images/ijs.jpeg";
import image10 from "../images/chips.jpeg";
import image11 from "../images/aardbei.jpg";

function OrderScreen() {
  const history = useHistory();

  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [sauces, setSauces] = useState([])
  const [orderlines, setOrderlines] = useState([]);

  const [total, setTotal] = useState(0);
  const [drinkQuantity, setDrinkQuantity] = useState(0);
  const [foodQuantity, setFoodQuantity] = useState(0);

  const [showHomeButton, setShowHomeButton] = useState(false);

  const [selectedSauces, setSelectedSauces] = useState({});

  const [collapsedCategories, setCollapsedCategories] = useState({
    food: true,
    frisdrank: true,
    bier: true,
    wijn: true,
    champagne: true,
    cocktail: true,
  });

  const [selectedFoodItemId, setSelectedFoodItemId] = useState(null);
  const [foodImages] = useState({
    1: image1,
    2: image2,
    3: image3,
    4: image4,
    5: image5,
    6: image6,
    7: image7,
    8: image8,
    9: image9,
    10: image10,
    39: image11,
  });


  useEffect(() => {
    fetchData();
    checkTafelIdInLocalStorage()
  }, []);

  const checkTafelIdInLocalStorage = () => {
    const localStorageData = localStorage.getItem("orderData");
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      if (parsedData.tafel_id !== null) {
        // tafel_id is not null, so show the home button
        setShowHomeButton(true);
      }
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/producten`);
      const data = await response.json();
      const products = data.map((product) => ({
        ...product,
        selectedSaus: ""
      }));
      setProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    try {
      const sauceResponse = await fetch(`https://lapista.depistezulte.be/api/sauzen`);
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
  
    // Automatically add the item to orderlines when sauce is selected
    if (selectedSauce !== "") {
      increaseFood(productId, selectedSauce);
    }
  };
  

  const increaseFood = (productId, selectedSauce) => {
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
          status: 0
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
    if (orderlines.length !== 0) {
      history.push({
        pathname: "/edit",
        state: { orderlines, id },  // Pass orderlines as part of the state
      });
    } else {
      window.alert("Kies eerst een product dat je wil bestellen!");
    }
  };
  
  const toggleCollapse = (category) => {
    setCollapsedCategories((prevState) => ({
      ...Object.keys(prevState).reduce((acc, curr) => {
        acc[curr] = curr === category ? !prevState[curr] : true;
        return acc;
      }, {})
    }));
  };

  const navigateBack = () => {
    history.push("/")
  }

  const openImagePopup = (productId) => {
    setSelectedFoodItemId(productId);
  };

  const closeImagePopup = () => {
    setSelectedFoodItemId(null);
  };

  const foodProducts = products.filter((product) => product.soort === "eten");
  const frisdrankProducts = products.filter((product) => product.soort === "frisdrank");
  const bierProducts = products.filter((product) => product.soort === "bier");
  const wijnProducts = products.filter((product) => product.soort === "wijn");
  const champagneProducts = products.filter((product) => product.soort === "champagne");
  const cocktailProducts = products.filter((product) => product.soort === "cocktail");

  const hasDrinks = orderlines.some((orderline) => orderline.saus === "/");
  const hasFoods = orderlines.some((orderline) => orderline.saus !== "/");

  return (
    <div className="order-container">

      <header className="header">

        <div className="header-info">
          <h2 className="title">MenuKaart</h2>
          {showHomeButton && (
            <button className="back-button-order" onClick={navigateBack}>
              Home
            </button>
          )}
        </div>

        <div>
          <div className="table-info">
            <p className="table-id">Tafel {id}</p>
            <p>Totaal: {total.toFixed(2)}€ - # dranken: {drinkQuantity} - # eten: {foodQuantity}</p>
          </div>
        </div>

      </header>

      <div className="content-body-order">

        <div className="all-order-items">

          <div className="ordered-items">
            <h2>Bestelde dranken</h2>
            {hasDrinks ? (
              <ul className="collapsible-items">
                {orderlines.map((orderline, index) => (
                  orderline.saus === "/" && (
                    <li key={orderline.id} className="product-item">
                      <div className="product-info">
                        <p>{orderline.naam}</p>
                      </div>
                      <div className="product-price">
                        <p>{orderline.hoeveelheid} stuks</p>
                      </div>
                      <div className="buttons">
                        <button className="decrease-button" onClick={() => decrease(index)}>
                          -
                        </button>
                      </div>
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <p>Bestel hieronder</p>
            )}
          </div>

          <div className="ordered-items">
            <h2>Bestelde gerechten</h2>
            {hasFoods ? (
              <ul className="collapsible-items">
                {orderlines.map((orderline, index) => (
                  orderline.saus !== "/" && (
                    <li key={orderline.id} className="product-item">
                      <div className="product-info">
                        <p>{orderline.naam} - {orderline.saus}</p>
                      </div>
                      <div className="product-price">
                        <p>{orderline.hoeveelheid} stuks</p>
                      </div>
                      <div className="buttons">
                        <button className="decrease-button" onClick={() => decrease(index)}>
                          -
                        </button>
                      </div>
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <p>Bestel hieronder</p>
            )}
          </div>
          
        </div>

        <button className="geef-door-button-order" onClick={handleGeefDoor}>
          {(hasFoods === false && hasDrinks === false) ? "Maak uw keuze" : "Geef uw bestelling door"}
        </button>


        <div className="collapsibles">

          <div className="collapsible">
            <h2 onClick={() => toggleCollapse('frisdrank')}>
              Frisdrank
              <FontAwesomeIcon icon={collapsedCategories.frisdrank ? faAngleDown : faAngleUp} />
            </h2>
            {!collapsedCategories.frisdrank && (
              <ul className="collapsible-items">
                {frisdrankProducts.map((product) => (
                  <li key={product.id} className="product-item">
                    <div className="product-info">
                      <p>{product.naam}</p>
                    </div>
                    <div className="product-price">
                      <p>{product.prijs}€</p>
                    </div>
                    <div className="buttons">
                      <button className="add-button" onClick={() => increaseDrinks(product.id)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="collapsible">
            <h2 onClick={() => toggleCollapse('bier')}>
              Bier
              <FontAwesomeIcon icon={collapsedCategories.bier ? faAngleDown : faAngleUp} />
            </h2>
            {!collapsedCategories.bier && (
              <ul className="collapsible-items">
                {bierProducts.map((product) => (
                  <li key={product.id} className="product-item">
                    <div className="product-info">
                      <p>{product.naam}</p>
                    </div>
                    <div className="product-price">
                      <p>{product.prijs}€</p>
                    </div>
                    <div className="buttons">
                      <button className="add-button" onClick={() => increaseDrinks(product.id)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="collapsible">
            <h2 onClick={() => toggleCollapse('wijn')}>
              Wijn
              <FontAwesomeIcon icon={collapsedCategories.wijn ? faAngleDown : faAngleUp} />
            </h2>
            {!collapsedCategories.wijn && (
              <ul className="collapsible-items">
                {wijnProducts.map((product) => (
                  <li key={product.id} className="product-item">
                    <div className="product-info">
                      <p>{product.naam}</p>
                    </div>
                    <div className="product-price">
                      <p>{product.prijs}€</p>
                    </div>
                    <div className="buttons">
                      <button className="add-button" onClick={() => increaseDrinks(product.id)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="collapsible">
            <h2 onClick={() => toggleCollapse('champagne')}>
              Champagne
              <FontAwesomeIcon icon={collapsedCategories.champagne ? faAngleDown : faAngleUp} />
            </h2>
            {!collapsedCategories.champagne && (
              <ul className="collapsible-items">
                {champagneProducts.map((product) => (
                  <li key={product.id} className="product-item">
                    <div className="product-info">
                      <p>{product.naam}</p>
                    </div>
                    <div className="product-price">
                      <p>{product.prijs}€</p>
                    </div>
                    <div className="buttons">
                      <button className="add-button" onClick={() => increaseDrinks(product.id)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="collapsible">
            <h2 onClick={() => toggleCollapse('cocktail')}>
              Cocktail
              <FontAwesomeIcon icon={collapsedCategories.cocktail ? faAngleDown : faAngleUp} />
            </h2>
            {!collapsedCategories.cocktail && (
              <ul className="collapsible-items">
                {cocktailProducts.map((product) => (
                  <li key={product.id} className="product-item">
                    <div className="product-info">
                      <p>{product.naam}</p>
                    </div>
                    <div className="product-price">
                      <p>{product.prijs}€</p>
                    </div>
                    <div className="buttons">
                      <button className="add-button" onClick={() => increaseDrinks(product.id)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="collapsible">
            <h2 onClick={() => toggleCollapse('food')}>
              Eten
              <FontAwesomeIcon icon={collapsedCategories.food ? faAngleDown : faAngleUp} />
            </h2>
            {!collapsedCategories.food && (
              <ul className="collapsible-items">
                {foodProducts.map((product) => (
                  <li key={product.id} className="product-item">
                    <div className="image-button">
                      <button onClick={() => openImagePopup(product.id)}>Foto</button>
                    </div>
                    <div className="product-info">
                      <p>{product.naam}</p>
                    </div>
                    <div className="product-price">
                      <p>{product.prijs}€</p>
                    </div>
                    <div className="buttons">
                      <button className="add-button" onClick={() => showDropDown(product.id)}>
                        {selectedSauces[product.id] ? "-" : "+"}
                      </button>
                      {selectedSauces[product.id] && (
                        <React.Fragment>
                          <select
                            value={selectedSauces[0]}
                            onChange={(event) => {
                              const selectedValue = event.target.value;
                              // Check if the selected value is not "Kies een saus"
                              if (selectedValue !== "Kies een saus") {
                                handleSauceChange(product.id, selectedValue);
                              }
                            }}
                          >
                            {[
                              { id: 'kies', saus: 'Kies een saus' },  // Add "Kies een saus" as the first sauce option
                              ...product.sauzen.map((saus) => ({ id: saus.id, saus: saus.saus }))
                            ].map((saus) => (
                              <option key={saus.id} value={saus.saus}>
                                {saus.saus}
                              </option>
                            ))}
                          </select>{" "}
                        </React.Fragment>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedFoodItemId !== null && (
            <ImagePopup
              imageUrl={foodImages[selectedFoodItemId]}
              onClose={closeImagePopup}
            />
          )}

        </div>
      </div>
    </div>
  );
}

export default OrderScreen;
