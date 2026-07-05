import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import GetProducts from './CRUD/products/GetProducts'
import ProductsScreen from './CRUD/products/ProductsScreen'
import CreateProduct from "./CRUD/products/CreateProduct";
import UpdateProduct from "./CRUD/products/UpdateProduct";
import HomeScreen from "./Screens/User/HomeScreen";
import OrderScreen from "./Screens/User/OrderScreen";
import TafelDetailScreen from "./Screens/Dashboard/TafelDetailScreen"
import OrdersHistoryScreen from "./Screens/Dashboard/OrdersHistoryScreen"
import FinancialScreen from "./Screens/Dashboard/FinancialScreen"
import SuccesScreen from "./Screens/User/SuccesScreen";
import EditScreen from "./Screens/User/EditScreen";

import OrdersScreen from "./Screens/barOrders/OrdersScreen";
import OrdersScreenBar1 from "./Screens/barOrders/OrdersScreenBar1";
import OrdersScreenBar2 from "./Screens/barOrders/OrdersScreenBar2";
import OrdersScreenBar3 from "./Screens/barOrders/OrdersScreenBar3";
import OrdersScreenBar1And2 from "./Screens/barOrders/OrdersScreenBar1And2";

import './App.css';

function App () {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={HomeScreen} />
        
        <Route path="/GetProducts" component={GetProducts} />
        <Route path="/products" component={ProductsScreen} />
        <Route path="/CreateProduct" component={CreateProduct} />
        <Route path="/updateProduct/:productId" component={UpdateProduct} />

        <Route path="/order/:id" component={OrderScreen} />
        <Route path="/tafel/:id" component={TafelDetailScreen} />
        <Route path="/ordersHistory" component={OrdersHistoryScreen} />
        <Route path="/financial" component={FinancialScreen} />

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
