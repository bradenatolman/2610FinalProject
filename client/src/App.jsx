import { useState } from 'react'
import './App.css'
// import { TableView } from './tableView.jsx';

function App() {

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

  async function enterPurchase() {
    // Functionality to enter a purchase
  }

  return (
    <>
      <div className="Navbar">
       <button onClick={enterPurchase}>Enter Purchase</button>
       <button onClick={logout}>Logout</button>

      </div>
      <div className="Page">
        {/* <TableView /> */}
       <button onClick={logout}>Logout</button>
      </div>
      
    </>
  )
}

export default App;
