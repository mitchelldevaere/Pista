import React from "react";
import { Popup } from "reactjs-popup";

function ImagePopup({ imageUrl, onClose }) {
  return (
    <Popup open={true} onClose={onClose}>
      <div className="image-popup-content">
      <img src={imageUrl} alt="Food Item" />
        <button className="image-popup-close" onClick={onClose}>
          Sluit
        </button>
      </div>
    </Popup>
  );
}

export default ImagePopup;
