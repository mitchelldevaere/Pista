import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import NavBar from "../../Util/NavBar";
import "../../styles/updateProduct.css"

const CreateProduct = () => {
  const [naam, setNaam] = useState("");
  const [prijs, setPrijs] = useState("");
  const [soort, setSoort] = useState("");

  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a product object
    const product = {
      naam: naam,
      prijs: prijs,
      soort: soort
    };

    try {
      // Send the product data to the server
      const response = await fetch("https://lapista.depistezulte.be/api/producten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });

      if (response.ok) {
        // Product was successfully created
        // Navigate to a different route (e.g., a success page)
        history.push("/GetProducts");
      } else {
        // Handle error response
        console.error("Failed to create product:", response.statusText);
      }
    } catch (error) {
      // Handle network or other errors
      console.error("An error occurred:", error);
    }
  };

  return (
    <div className="container-update">
      <NavBar></NavBar>
      <h2 className="h2-update">Create Product</h2>
      <form onSubmit={handleSubmit} className="form-update">
        <div>
          <label className="label-input">Naam:</label>
          <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} className="input-update"/>
        </div>
        <div>
          <label className="label-update">Prijs:</label>
          <input type="number" value={prijs} onChange={(e) => setPrijs(e.target.value)} className="input-update"/>
        </div>
        <div>
          <label className="label-update">Soort:</label>
          <textarea value={soort} onChange={(e) => setSoort(e.target.value)} className="textarea-update"/>
        </div>
        <div>
          <button type="submit" className="button-update">Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
