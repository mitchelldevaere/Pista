import React, { useState, useEffect } from "react";
import NavBar from "../../Util/NavBar";
import { useHistory } from 'react-router-dom';
import "../../styles/getProduct.css"

// Same categories the customer menu (OrderScreen.js) filters on. Anything whose "soort"
// doesn't match one of these exactly is invisible there, so it's grouped here under
// "Overig" instead of being silently dropped, to make miscategorized products visible.
const KNOWN_CATEGORIES = ["eten", "frisdrank", "bier", "wijn", "champagne", "cocktail"];
const OTHER_CATEGORY = "Overig";

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

  const groupedProducts = [...KNOWN_CATEGORIES, OTHER_CATEGORY].map((category) => ({
    category,
    items: products.filter((product) =>
      category === OTHER_CATEGORY
        ? !KNOWN_CATEGORIES.includes(product.soort)
        : product.soort === category
    ),
  })).filter((group) => group.items.length > 0);

  const renderProductTable = (items) => (
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
          {items.map((product) => (
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
  );

  return (
    <div className="container-product">
      <NavBar className="navbar-product" />
      <h2 className="h2-product">Producten</h2>

      {loading ? (
        <p>Laden...</p>
      ) : (
        <>
          {groupedProducts.map((group) => (
            <React.Fragment key={group.category}>
              <h3 className="h3-product">
                {group.category}
                {group.category === OTHER_CATEGORY && ' (onbekende soort - onzichtbaar in de bestel-app)'}
              </h3>
              {renderProductTable(group.items)}
            </React.Fragment>
          ))}

          <button className="create-button-product" onClick={() => CreateButtonClicked()}>Create</button>
        </>
      )}
    </div>
  );
};

export default ProductsScreen;
