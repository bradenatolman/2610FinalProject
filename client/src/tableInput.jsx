import { useState } from "react";
import * as cookie from "cookie";

export function EditText(props) {
  const { id, type, name, changed, setChanged } = props;

  const [text, setText] = useState(name);

  function handleSubmit(e) {
    e.preventDefault();
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
          type="text"
          value={text}
          size={text.length || 1}   // auto resize
          onChange={(e) => setText(e.target.value)}
        />
      </label>
    </form>
  );
}


export function EditNum(props) {
    const {ismonth, month, id, number, changed, setChanged} = props;
    const [num, setNum] = useState(number || 0);

  function handleSubmit(e) {
    e.preventDefault();
    changeNum(id, num);
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
            style={{ width: `${(num.toString().length +4)}ch` }}
            onChange={(e) => setNum(e.target.value)}
          />
        </label>
      </div>
    </form>
  )
}