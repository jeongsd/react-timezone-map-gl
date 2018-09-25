import React from "react";
import PropTypes from "prop-types";
// import MenuItem from "@material-ui/Menu/MenuItem";
// import TextField from "material-ui/TextField";
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import { List } from "react-virtualized";

const options = Array.from(Array(1000).keys());

function focusFirstItem() {
  const els = document.getElementsByClassName("menu-item");
  if (els && els[0]) {
    els[0].focus();
  }
}

class TextFields extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      open: false
    };
    this.rowRenderer = this.rowRenderer.bind(this);
  }
  rowRenderer(row) {
    const { key, index, style } = row;
    const option = options[index];
    return (
      <MenuItem
        key={key}
        // className="menu-item"
        // style={{
        //   ...style,
        //   paddingTop: "0",
        //   paddingBottom: "0"
        // }}
        // onClick={() => {
        //   this.setState({ value: option });
        //   this.setState({ open: false });
        // }}
        value={option}
      >
        <div>{option}</div>
      </MenuItem>
    );
  }

  render() {
    return (
      <div>
        <TextField
          select
          label="With React Virtualized"
          value={this.state.value}
          // SelectProps={{
          //   MenuProps: {
          //     onEntered: focusFirstItem
          //   },
          //   renderValue: selected => {
          //     return selected;
          //   },
          //   open: this.state.open,
          //   onOpen: () => {
          //     this.setState({ open: true });
          //   },
          //   onClose: () => {
          //     this.setState({ open: false });
          //   }
          // }}
          margin="normal"
          style={{
            width: 200
          }}
        >
          <List
            width={200}
            height={500}
            rowCount={options.length}
            rowHeight={48}
            rowRenderer={this.rowRenderer}
          />
        </TextField>

        <TextField
          select
          label="Without React Virtualized"
          value={this.state.value}
          margin="normal"
          onChange={e => {
            const value = e.target.value;
            this.setState({ value });
          }}
          style={{
            width: 200
          }}
        >
          {options.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </div>
    );
  }
}

export default TextFields;
