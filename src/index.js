//import neo4j from 'neo4j-driver';
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { GraphAppBase, ConnectModal, CONNECTED } from "graph-app-kit/components/GraphAppBase"


const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js");
const integrationPoint = window.neo4jDesktopApi;


export const NewApp = () => (
    <GraphAppBase
    driverFactory={neo4j.v1}
    integrationPoint={integrationPoint}
    render={({
	connectionState,
	connectionDetails,
	setCredentials,
	on,
	off,
	initialDesktopContext
    }) => {
	return [
	    <ConnectModal
	    key="modal"
	    errorMsg={connectionDetails ? connectionDetails.message : ""}
	    onSubmit={setCredentials}
	    show={connectionState !== CONNECTED}
	    />,
	    <App key="app" />
	];
    }}
    />
);


ReactDOM.render(<NewApp />, document.getElementById('root'))
