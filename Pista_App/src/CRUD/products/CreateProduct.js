import React, { useState } from "react";
import { useHistory } from 'react-router-dom';
import NavBar from "../../Util/NavBar";

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
      const response = await fetch("http://localhost:5000/api/producten", {
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
    <div>
      <NavBar></NavBar>
      <h2>Create Product</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Naam:</label>
          <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} />
        </div>
        <div>
          <label>Prijs:</label>
          <input type="number" value={prijs} onChange={(e) => setPrijs(e.target.value)} />
        </div>
        <div>
          <label>Soort:</label>
          <textarea value={soort} onChange={(e) => setSoort(e.target.value)} />
        </div>
        <div>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
