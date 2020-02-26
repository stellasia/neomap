import React, { Component } from 'react';
import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import LayersList from './layers/layers_list';
import download from 'downloadjs';


class SideBar extends Component {

	constructor(props) {
		super(props);

		this.state = {
			layers: props.layers,
			driver: props.driver
		};

		this.sendData = this.sendData.bind(this);
		this.saveConfigToFile = this.saveConfigToFile.bind(this);
		this.loadConfigFromFile = this.loadConfigFromFile.bind(this);

	};


	sendData(layers) {
		/*Receives data from child layer
           and propagete it to parent
         */
		this.setState({
			layers: layers.layers
		}, () => {
			this.props.layersChanged({
				layers: layers.layers
			});
		});
	};


	saveConfigToFile(e) {
		let config = JSON.stringify(this.state.layers);
		let fileName = "neomap_config.json";
		download(config, fileName, "application/json");
		e.preventDefault();
	};


	loadConfigFromFile(e) {
		const fileSelector = document.createElement('input');
		fileSelector.setAttribute('type', 'file');
		fileSelector.click();
		fileSelector.onchange = (ev) => {
			const file = ev.target.files[0];
			let fileReader = new FileReader();
			fileReader.onloadend = (e) => {
				const content = e.target.result;
				const layers = JSON.parse(content);
				// send data upward (to the Map)
				this.sendData({layers: layers});
				// send data downward (to the layerList)
				this.refs.layersList.updateLayers(layers);
			};
			fileReader.readAsText(file);
		};
		e.preventDefault();
	};


	render() {
		return (
			<div>
				<Navbar bg="light" expand="lg">
					<Navbar.Brand href="#home">neomap</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							<NavDropdown title="File" id="basic-nav-dropdown">
								<NavDropdown.Item
									href="#"
									onClick={(e)=> this.saveConfigToFile(e)}
								>
									Save As
								</NavDropdown.Item>
								<NavDropdown.Item
									href="#"
									onClick={(e)=> this.loadConfigFromFile(e)}
								>
									Open
								</NavDropdown.Item>
							</NavDropdown>
						</Nav>
					</Navbar.Collapse>
				</Navbar>
				<LayersList
					ref="layersList"
					layers = {this.state.layers}
					sendData = {this.sendData}
					driver = {this.state.driver}
				/>
			</div>
		);
	};
};


export default SideBar;
