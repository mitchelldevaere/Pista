import React, { useState, useEffect } from "react";
import { useHistory, useParams } from 'react-router-dom';
import NavBar from "../../Util/NavBar";
import "../../styles/updateProduct.css"

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
        const response = await fetch(`https://lapista.depistezulte.be/api/producten/${productId}`);
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
      const response = await fetch(`https://lapista.depistezulte.be/api/producten/${productId}`, {
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
    <div className="container-update">
      <NavBar></NavBar>
      <h2 className="h2-update">Update Product</h2>
      <form onSubmit={handleUpdate} className="form-update">
        <div>
          <label className="label-update">Naam:</label>
          <input type="text" value={product.naam} onChange={(e) => setProduct({ ...product, naam: e.target.value })} className="input-update" />
        </div>
        <div>
          <label className="label-update">Prijs:</label>
          <input type="number" value={product.prijs} onChange={(e) => setProduct({ ...product, prijs: e.target.value })} className="input-update"/>
        </div>
        <div>
          <label className="label-update">Soort:</label>
          <textarea value={product.soort} onChange={(e) => setProduct({ ...product, soort: e.target.value })} className="textearea-update"/>
        </div>
        <div>
          <button type="submit" className="button-update">Update</button>
        </div>
      </form>
    </div>
  );
};

export default UpdateProduct;
