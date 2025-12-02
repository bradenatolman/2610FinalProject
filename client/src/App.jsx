import { useState } from 'react'
import './App.css'
import { TableView } from './tableView.jsx';

function App() {
  const [edit, setEdit] = useState(false);

  async function logout() {
    const res = await fetch("/registration/logout/", {
      credentials: "same-origin", // include cookies!
    });

    if (res.ok) {
      // navigate away from the single page app!
      window.location = "/registration/sign_in/";
    } else {
      // handle logout failed!
    }
  }

  return (
    <>
      <div className="Navbar">
        <button onClick={() => setEdit(!edit)}> {edit ? "Edit Off" : "Edit"}</button>
       <button onClick={logout}>Logout</button>
      </div>
      <div className="Page">
        <TableView edit={edit} />
      </div>
      
    </>
  )
}

export default App;
