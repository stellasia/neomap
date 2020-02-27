import React from 'react'
import reactCSS from 'reactcss'
import {SketchPicker} from 'react-color'

class ColorPicker extends React.Component {


    constructor(props) {
        super(props);
        let defaultColor = {
            r: 0, g: 0, b: 255, a: 1
        };
        this.state = {
            displayColorPicker: false,
            color: props.color || defaultColor,
        };
    }

    handleClick = () => {
        this.setState({displayColorPicker: !this.state.displayColorPicker})
    };

    handleClose = () => {
        this.setState({displayColorPicker: false})
    };

    handleChange = (color) => {
        this.setState({color: color.rgb});
        this.props.handleColorChange(color.rgb);
    };

    render() {
        let rgba_color = `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`;

        const styles = reactCSS({
            'default': {
                color: {
                    padding: '5px',
                    width: '50px',
                    height: '20px',
                    background: rgba_color,
                },
                swatch: {
                    marginLeft: '10px',
                    display: 'inline-block',
                    cursor: 'pointer',
                },
                popover: {
                    position: 'absolute',
                    zIndex: '2',
                    bottom: '110px',
                    left: '100px',
                },
                cover: {
                    position: 'fixed',
                    bottom: '10px',
                    left: '0px',
                },
            },
        });

        return (
            <div>
                <div style={styles.swatch} onClick={this.handleClick}>
                    <div style={styles.color}/>
                </div>
                {this.state.displayColorPicker ? <div style={styles.popover}>
                    <div style={styles.cover} onClick={this.handleClose}/>
                    <SketchPicker color={this.state.color} onChange={this.handleChange} disableAlpha={false} />
                </div> : null}
            </div>
        )
    }
}

export default ColorPicker;