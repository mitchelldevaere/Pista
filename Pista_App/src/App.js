import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import GetProducts from './CRUD/products/GetProducts'
import CreateProduct from "./CRUD/products/CreateProduct";
import UpdateProduct from "./CRUD/products/UpdateProduct";
import HomeScreen from "./Screens/HomeScreen";
import OrderScreen from "./Screens/OrderScreen";
import TafelDetailScreen from "./Screens/TafelDetailScreen"
import SuccesScreen from "./Screens/SuccesScreen";
import EditScreen from "./Screens/EditScreen";

import OrdersScreen from "./Screens/OrdersScreen";
import OrdersScreenBar1 from "./Screens/OrdersScreenBar1";
import OrdersScreenBar2 from "./Screens/OrdersScreenBar2";
import OrdersScreenBar3 from "./Screens/OrdersScreenBar3";
import OrdersScreenBar1And2 from "./Screens/OrdersScreenBar1And2";

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

        <Route path="/succes" component={SuccesScreen} />
        <Route path="/edit" component={EditScreen} />

        <Route path="/orders" component={OrdersScreen} />
        <Route path="/ordersBar1" component={OrdersScreenBar1} />
        <Route path="/ordersBar2" component={OrdersScreenBar2} />
        <Route path="/ordersBar3" component={OrdersScreenBar3} />
        <Route path="/ordersBar1And2" component={OrdersScreenBar1And2} />
      </Switch>
    </Router>
  );
};

export default App;
