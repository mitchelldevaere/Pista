import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/homeScreen.css';
import logo from '../images/La-Pista-logo-kleur.jpg';

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
  }
  console.log(hash.toString())
  return hash.toString();
}

function HomeScreen() {
  const history = useHistory();

  const [localStorageData, setLocalStorageData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [tafelId, setTafelId] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  useEffect(() => {
    history.push("/");
    // Retrieve data from localStorage
    const localStorageData = localStorage.getItem("orderData");
    if (localStorageData) {
      
      const parsedData = JSON.parse(localStorageData);
      setOrderId(parsedData.order.id);
      setTafelId(parsedData.order.tafel_id);
      setLocalStorageData(parsedData);
      console.log(parsedData)
    }

    const timer = setInterval(() => {
      fetchData(orderId);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [history, orderId]);

  const fetchData = async (orderId) => {
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/order/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data)

        const order = {
          creation: data.creation,
          id: data.id,
          modification: data.modification,
          tafel_id: data.tafel_id
        }

        // Update localStorage with the new data in the required structure
        const newLocalStorageData = {
          order: order,
          orderlines: data.orderlines,
        };

        localStorage.setItem("orderData", JSON.stringify(newLocalStorageData));

        // Update state with the new data
        setLocalStorageData(newLocalStorageData);
        console.log(newLocalStorageData)
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  function calculateTotalOrderPrice(orderlines) {
    let total = 0;
    for (const orderline of orderlines) {
      total += orderline.prijs * orderline.hoeveelheid;
    }
    return total;
  }

  const handleOrderNavigation = () => {
    if(tafelId !== 0){
      history.push(`/order/${tafelId}`);
    } else {
      window.alert("Scan eerst de QR code van je tafel")
    }
  };

  const handleLogoClick = () => {
    // Increment click count
    const newClickCount = clickCount + 1;
    setClickCount(newClickCount);

    // Check if the desired click count is reached (e.g., 10)
    if (newClickCount === 10) {
      // Show password prompt
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = () => {
    // You should use a more secure hashing algorithm in production
    const hashedPassword = hashPassword(password);

    // Check if hashed password is correct and navigate
    if (hashedPassword === '105917744') {
      history.push("/GetProducts");
    } else {
      window.alert("Incorrect password");
    }

    // Reset click count and password-related states
    setClickCount(0);
    setPassword('');
    setShowPasswordPrompt(false);
  };

  return (
    <div className="home-container" translate="no">
      <div className="title-home" onClick={handleLogoClick}>
        <img src={logo} alt="logo la pista" height="100"></img>
      </div>

      {showPasswordPrompt && (
        <div className="password-prompt">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handlePasswordSubmit}>Submit</button>
        </div>
      )}

      {localStorageData ? (
        <div>
          <div className="buttons-home">
            <button onClick={handleOrderNavigation}>Nieuwe bestelling</button>
          </div>

          {localStorageData && (
        <div className="order-details-home">
          <h2>Laatste bestelling</h2>
          <table className="order-table-home">
            <thead>
              <tr className="orderline-row-home">
                <th>Product</th>
                <th>Hoeveelheid</th>
                <th>Prijs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {localStorageData.orderlines.map((orderline, index) => (
                <tr key={index} className="orderline-row-home">
                  <td>{orderline.naam}</td>
                  <td>{orderline.hoeveelheid}</td>
                  <td>{orderline.prijs * orderline.hoeveelheid}€</td>
                  <td>
                    {orderline.status === 1 ? (
                      <p>klaar</p>
                    ) : (
                      <p>niet klaar</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="total-price">
            <p>Totaal: {calculateTotalOrderPrice(localStorageData.orderlines) * 2} vakjes</p>
          </div>
        </div>
      )}
        </div>
      ) : (
        <p>Scan eerst een QR code om te bestellen</p>
      )}
    </div>
  );
}

export default HomeScreen;
