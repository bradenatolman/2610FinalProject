import { useState } from "react";
import * as cookie from "cookie";

export function EditText(props) {
  const { id, type, name, changed, setChanged } = props;
  const [yellow, setYellow] = useState(false);
  const [text, setText] = useState(name);

  function handleSubmit(e) {
    e.preventDefault();
    setYellow(false);
    changeName(type, id, text);
  }

  async function changeName(type, id, text) {
    const res = await fetch(`/change/`, {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({ content:text, type, id }), 
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookie.parse(document.cookie).csrftoken,
      },
    });
    
    setChanged(!changed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <input
          style={{ backgroundColor: yellow ? "yellow" : "white" }}
          type="text"
          value={text}
          size={text.length || 1}   // auto resize
          onChange={(e) => {setText(e.target.value); setYellow(true)}}
        />
      </label>
    </form>
  );
}


export function EditNum(props) {
    const {ismonth, month, id, number, changed, setChanged} = props;
    const [num, setNum] = useState(number || 0);
    const [yellow, setYellow] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    changeNum(id, num);
    setYellow(false);
  }

  async function changeNum(id, num) {
    const res = await fetch(`/change/`, {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({ content: num, id, type: 'number', month, ismonth}), 
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookie.parse(document.cookie).csrftoken,
      },
    });
    
    setChanged(!changed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <input
            type="number"
            value={num}
            style={{ width: `${(num.toString().length +4)}ch`, backgroundColor: yellow ? "yellow" : "white" }}
            onChange={(e) => {setNum(e.target.value); setYellow(true)}}
          />
        </label>
      </div>
    </form>
  )
}

export function EditColor(props) {
    const {id, val, changed, setChanged} = props;
    const [color, setColor] = useState(val);

  function handleSubmit(e) {
    e.preventDefault();
    changeColor(id, color);
  }

  async function changeColor(id, color) {
    const res = await fetch(`/change/`, {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({ content: color, id, type: 'color' }), 
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": cookie.parse(document.cookie).csrftoken,
      },
    });
    document.documentElement.style.setProperty(`--cat-color-${id}`, color);
    setChanged(!changed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          <input
            type="color"
            value={color}
            onChange={(e) => {setColor(e.target.value); changeColor(id, e.target.value);}}
          />
        </label>
      </div>
    </form>
  )
}