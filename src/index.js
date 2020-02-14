import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { GraphAppBase } from "graph-app-kit/components/GraphAppBase"

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;
const integrationPoint = window.neo4jDesktopApi;


export const NewApp = () => (

	<GraphAppBase
		driverFactory={neo4j}
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
				<App key="app"
					 integrationPoint={integrationPoint}
					 connectionDetails={connectionDetails}
					 connectionState={connectionState}
					 initialDesktopContext={initialDesktopContext}
				/>
			];
		}}
	/>
);


ReactDOM.render(<NewApp />, document.getElementById('root'))
