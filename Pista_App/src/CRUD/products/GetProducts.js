import React, { useState, useEffect } from "react";
import NavBar from "../../Util/NavBar";
import { useHistory } from 'react-router-dom';

const ProductList = () => {
  const history = useHistory();

  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/producten");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

const deleteProduct = async(productId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/producten/${productId}`, {
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
    <div>
      <NavBar/>
      <h2>Product List</h2>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <p>ID: {product.id} - Naam: {product.naam} - Prijs: {product.prijs} - Soort: {product.soort}<button onClick={() => deleteProduct(product.id)}>Delete</button><button onClick={() => updateProduct(product.id)}>Update</button></p>
          </li>
        ))}
      </ul>
      <button onClick={() => CreateButtonClicked()}>Create</button>
    </div>
  );
};

export default ProductList;
