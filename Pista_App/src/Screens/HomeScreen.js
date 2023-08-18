import React from 'react';
import { useHistory } from 'react-router-dom';

function HomeScreen() {
  const history = useHistory();

  const handleQRScanNavigation = (uniqueId) => {
    history.push(`/order/${uniqueId}`);
  };
  const handleTafelClick = (uniqueId) => {
    history.push(`/tafel/${uniqueId}`);
  };
  const handleOpenClick = () => {
    history.push(`/orders`);
  };

  return (
    <div>
      <h1>Home Screen</h1>
      <button onClick={() => handleQRScanNavigation(12)}>
        SCAN
      </button>
      <button onClick={() => handleTafelClick(12)}>
        TAFEL
      </button>
      <button onClick={() => handleOpenClick()}>
        ORDERSLIST
      </button>
    </div>
  );
}

export default HomeScreen;
