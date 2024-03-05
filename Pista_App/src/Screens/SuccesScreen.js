import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../styles/succesScreen.css";

function SuccesScreen() {
  const history = useHistory();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    getOrderDataFromLocalStorage();
  }, []);

  const getOrderDataFromLocalStorage = () => {

    const orderDataStorage = localStorage.getItem("orderData");
    console.log(orderDataStorage)

    if (orderDataStorage) {
      const parsedOrderData = JSON.parse(orderDataStorage);
      console.log(parsedOrderData)
      setOrderData(parsedOrderData);
    } 
  };

  const navigateBack = () => {
    history.push(`/`);
  };

  const calculateOrderlineTotal = (orderline) => {
    return orderline.prijs * orderline.hoeveelheid;
  };

  const calculateTotalOrderPrice = () => {
    if (orderData) {
      return orderData.orderlines.reduce(
        (total, orderline) => total + calculateOrderlineTotal(orderline),
        0
      );
    }
    return 0;
  };

  return (
    <div className="container-succesScreen" translate="no">
      <div className="header-succes">
        <div>
          <h1>Bedankt voor je bestelling!</h1>
        </div>
        <div>
          <p>Bestelling: {orderData?.order?.id}</p>
          <p>Tafel: {orderData?.order?.tafel_id}</p>
        </div>
      </div>

      {orderData ? (
        <div className="content-body-succes">
          <div>
            <h2>Jouw bestelling:</h2>
          </div>

          <table className="order-table-succes">
            <thead>
              <tr>
                <th>Product</th>
                <th>Prijs</th>
                <th>Hoeveelheid</th>
                <th>Saus</th>
                <th>Totaal</th>
              </tr>
            </thead>
            <tbody>
              {orderData.orderlines.map((orderline, index) => (
                <tr key={index} className="orderline-row-succes">
                  <td>{orderline.naam}</td>
                  <td>{orderline.prijs}€</td>
                  <td>{orderline.hoeveelheid}</td>
                  <td>{orderline.saus !== "/" ? orderline.saus : "/"}</td>
                  <td>{calculateOrderlineTotal(orderline)}€</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="total-price-succes">
            <p>Totaal: {calculateTotalOrderPrice() * 2} vakjes</p>
          </div>

          <div>
            <button className="back-button-succes" onClick={() => navigateBack()}>Home</button>
          </div>

        </div>
      ) : (
        <p>Bedankt voor uw bestelling. Deze wordt op dit moment verwerkt.</p>
      )}
    </div>
  );
}

export default SuccesScreen;
