import React, { useState, useEffect } from "react";
import { useHistory, useParams } from 'react-router-dom';
import NavBar from "../../Util/NavBar";

const UpdateProduct = () => {
  const { productId } = useParams(); // Assuming the product ID is part of the URL
  const history = useHistory();

  const [product, setProduct] = useState({
    naam: "",
    prijs: "",
    soort: "",
  });

  useEffect(() => {
    // Fetch the product data from the server using the product ID
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/producten/${productId}`);
        if (response.ok) {
          const productData = await response.json();
          // Update the product state with the fetched data
          setProduct(productData);
        } else {
          console.error("Failed to fetch product:", response.statusText);
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      // Send the updated product data to the server
      const response = await fetch(`http://localhost:5000/api/producten/${productId}`, {
        method: "PUT", // Use PUT for updates
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
      });

      if (response.ok) {
        // Product was successfully updated
        // Navigate to a different route (e.g., a success page)
        history.push("/GetProducts");
      } else {
        // Handle error response
        console.error("Failed to update product:", response.statusText);
      }
    } catch (error) {
      // Handle network or other errors
      console.error("An error occurred:", error);
    }
  };

  return (
    <div>
      <NavBar></NavBar>
      <h2>Update Product</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Naam:</label>
          <input type="text" value={product.naam} onChange={(e) => setProduct({ ...product, naam: e.target.value })} />
        </div>
        <div>
          <label>Prijs:</label>
          <input type="number" value={product.prijs} onChange={(e) => setProduct({ ...product, prijs: e.target.value })} />
        </div>
        <div>
          <label>Soort:</label>
          <textarea value={product.soort} onChange={(e) => setProduct({ ...product, soort: e.target.value })} />
        </div>
        <div>
          <button type="submit">Update</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
