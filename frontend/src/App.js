import React, { useState, useEffect } from "react";
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import {Main, Patient} from './components/Main';
import "./styles.css";


export default function App() {


  return (<BrowserRouter>
        <Switch>
    <Route path="/" exact component={()=><Main/>}/>
    <Route path="/patient/:id"  exact component={()=><Patient/>}/>
        </Switch>
  </BrowserRouter>);
 
}
