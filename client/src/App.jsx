import { useState } from 'react'
import './App.css'
import { TableView } from './tableView.jsx';
import { EnterPurchase } from './enterPurchase.jsx';
import { CreateCategory } from './createCategory.jsx';

function App() {
  const [showEnterPurchase, setShowEnterPurchase] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(true);
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
    <div className="App">
      <div className="Navbar">
       <button onClick={() => setShowEnterPurchase(prev => !prev)}>Enter Purchase</button>
       <button onClick={() => setShowCreateCategory(prev => !prev)}>Create Category</button>
       <button onClick={() => setEdit(!edit)}> {edit ? "Edit Off" : "Edit"}</button>
       <button onClick={logout}>Logout</button>
      </div>
      
      {showEnterPurchase && <div className="EnterPurchase">
        <EnterPurchase />
      </div>}

      {showCreateCategory && <div className="CreateCategory">
        <CreateCategory />
      </div>}

      <div className="Page">  
        { <TableView /> }
      </div>
      
    </div>
  )
}

export default App;
