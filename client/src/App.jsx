import { useState } from 'react'
import './App.css'
// import { TableView } from './tableView.jsx';
import { EnterPurchase } from './enterPurchase.jsx';
import { CreateCategory } from './createCategory.jsx';

function App() {
  const [showEnterPurchase, setShowEnterPurchase] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(true);

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
       <button onClick={() => setShowEnterPurchase(prev => !prev)}>Enter Purchase</button>
       <button onClick={() => setShowCreateCategory(prev => !prev)}>Create Category</button>
       <button onClick={logout}>Logout</button>
      </div>
      
      {showEnterPurchase && <div className="EnterPurchase">
        <EnterPurchase />
      </div>}

      {showCreateCategory && <div className="CreateCategory">
        <CreateCategory />
      </div>}

      <div className="Page">  
        {/* <TableView /> */}
      </div>
      
    </>
  )
}

export default App;
