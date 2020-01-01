/**Cypher Layer definition
 */
import React, {Component} from 'react';
import {Form} from 'react-bootstrap';
import {CypherEditor} from "graph-app-kit/components/Editor"
// css needed for CypherEditor
import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import "cypher-codemirror/dist/cypher-codemirror-syntax.css";


class CypherLayer extends Component {

    constructor(props) {
        super(props);

        this.driver = props.driver;

        this.state = {cypher: props.initQuery};

        this.handleCypherChange = this.handleCypherChange.bind(this);

    };


    getQuery() {
        return this.state.cypher;
    };


    handleCypherChange(e) {
        this.setState({cypher: e});
    };


    render() {
        return (
            <Form.Group controlId="formCypher">
                <Form.Label>Query</Form.Label>
                <Form.Text>
                    <p>Checkout <a href="https://github.com/stellasia/neomap/wiki" target="_blank"
                                   rel="noopener noreferrer">the documentation</a> (Ctrl+SPACE for autocomplete)</p>
                    <p className="font-italic">Be careful, the browser can only display a limited number of nodes (less
                        than a few 10000)</p>
                </Form.Text>
                <CypherEditor
                    value={this.state.cypher}
                    onValueChange={this.handleCypherChange}
                    name="cypher"
                />
            </Form.Group>
        )
    };

}


export default CypherLayer;