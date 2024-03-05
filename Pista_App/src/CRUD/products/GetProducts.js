import React, { useState, useEffect } from "react";
import NavBar from "../../Util/NavBar";
import { useHistory } from 'react-router-dom';
import "../../styles/getProduct.css"

const ProductList = () => {
  const history = useHistory();

  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("https://lapista.depistezulte.be/api/producten");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const deleteProduct = async (productId) => {
    // Show a confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");
  
    if (!isConfirmed) {
      return; // If the user cancels the deletion, do nothing
    }
  
    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/producten/${productId}`, {
        method: "DELETE",
      });
  
      if (response.status === 204) {
        // Product was deleted successfully, refresh the product list
        fetchProducts();
      } else {
        console.error("Error deleting product. Status:", response.status);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

const updateProduct = (productId) => {
  history.push(`/updateProduct/${productId}`);
}

const CreateButtonClicked = () => {
  history.push('/CreateProduct');
}

useEffect(() => {
  fetchProducts();
}, []);

return (
  <div className="container-product">
    <NavBar className="navbar-product" />
    <h2 className="h2-product">Product List</h2>
    <ul className="ul-product">
      {products.map((product) => (
        <li key={product.id} className="li-product">
          <p className="p-product">
            ID: {product.id} - Naam: {product.naam} - Prijs: {product.prijs} - Soort: {product.soort}
          </p>
          <div>
            <button onClick={() => deleteProduct(product.id)} className="button-product">Delete</button>
            <button onClick={() => updateProduct(product.id)} className="button-product">Update</button>
          </div>
        </li>
      ))}
    </ul>
    <button className="create-button-product" onClick={() => CreateButtonClicked()}>Create</button>
  </div>
);
};

export default ProductList;
