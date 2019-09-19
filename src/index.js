import neo4j from 'neo4j-driver';
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";


const NewApp = () => (
	    <App key="app" />
);


ReactDOM.render(<NewApp />, document.getElementById('root'))
