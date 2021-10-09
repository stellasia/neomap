import React from "react";
import reactCSS from "reactcss";
import { SketchPicker } from "react-color";

export const ColorPicker = React.memo(({ color, handleColorChange }) => {
  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const selectColor = (proposedColor) => {
    handleColorChange(proposedColor.rgb);
  };

  const selectedColor = color || { r: 0, g: 0, b: 255, a: 1 };
  let rgba_color = `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${selectedColor.a})`;

  const styles = reactCSS({
    default: {
      color: {
        padding: "5px",
        width: "50px",
        height: "20px",
        background: rgba_color,
      },
      swatch: {
        marginLeft: "10px",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
        bottom: "110px",
        left: "100px",
      },
      cover: {
        position: "fixed",
        bottom: "10px",
        left: "0px",
      },
    },
  });

  return (
    <div>
      <div style={styles.swatch} onClick={handleClick}>
        <div style={styles.color} />
      </div>
      {displayColorPicker ? (
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose} />
          <SketchPicker color={color} onChange={selectColor} disableAlpha={false} />
        </div>
      ) : null}
    </div>
  );
});
