import { useState } from 'react'
import './App.css'
// import { TableView } from './tableView.jsx';
import { EnterPurchase } from './enterPurchase.jsx';

function App() {
  const [showEnterPurchase, setShowEnterPurchase] = useState(false);

  async function enterPurchase() {
    setShowEnterPurchase(true);
  } 

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
       <button onClick={() => setShowEnterPurchase(true)}>Enter Purchase</button>
       <button onClick={logout}>Logout</button>
      </div>
      
      {showEnterPurchase && <div className="EnterPurchase">
        <EnterPurchase />
      </div>}
      
      <div className="Page">  
        {/* <TableView /> */}
      </div>
      
    </>
  )
}

export default App;
