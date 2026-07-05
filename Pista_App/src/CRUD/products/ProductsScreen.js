import React, { useState, useEffect } from "react";
import NavBar from "../../Util/NavBar";
import { useHistory } from 'react-router-dom';
import "../../styles/getProduct.css"

const ProductsScreen = () => {
  const history = useHistory();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const isConfirmed = window.confirm("Are you sure you want to delete this product?");

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await fetch(`https://lapista.depistezulte.be/api/producten/${productId}`, {
        method: "DELETE",
      });

      if (response.status === 204) {
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
    fetchProducts().finally(() => setLoading(false));

    const refreshInterval = setInterval(() => {
      fetchProducts();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <div className="container-product">
      <NavBar className="navbar-product" />
      <h2 className="h2-product">Producten</h2>

      {loading ? (
        <p>Laden...</p>
      ) : (
        <>
          <div className="table-wrapper-product">
            <table className="data-table-product">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naam</th>
                  <th>Prijs</th>
                  <th>Soort</th>
                  <th>Bar</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.naam}</td>
                    <td>{product.prijs}€</td>
                    <td>{product.soort}</td>
                    <td>{product.bar}</td>
                    <td>
                      <button onClick={() => deleteProduct(product.id)} className="button-product">Delete</button>
                      <button onClick={() => updateProduct(product.id)} className="button-product">Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="create-button-product" onClick={() => CreateButtonClicked()}>Create</button>
        </>
      )}
    </div>
  );
};

export default ProductsScreen;
