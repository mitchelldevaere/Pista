import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import GetProducts from './CRUD/products/GetProducts'
import CreateProduct from "./CRUD/products/CreateProduct";
import UpdateProduct from "./CRUD/products/UpdateProduct";
import HomeScreen from "./Screens/HomeScreen";
import OrderScreen from "./Screens/OrderScreen";
import TafelDetailScreen from "./Screens/TafelDetailScreen"
import OrdersScreen from "./Screens/OrdersScreen";
import './App.css';

function App () {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomeScreen} />
        <Route path="/GetProducts" component={GetProducts} />
        <Route path="/CreateProduct" component={CreateProduct} />
        <Route path="/updateProduct/:productId" component={UpdateProduct} />
        <Route path="/order/:id" component={OrderScreen} />
        <Route path="/tafel/:id" component={TafelDetailScreen} />
        <Route path="/orders" component={OrdersScreen} />
      </Switch>
    </Router>
  );
};

export default App;
