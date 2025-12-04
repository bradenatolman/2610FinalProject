import { useState } from 'react'
import './App.css'
import { TableView } from './tableView.jsx';
import { EnterPurchase } from './enterPurchase.jsx';
import { CreateCategory } from './createCategory.jsx';
import { CreateSubCat } from './createSubCat.jsx';

function App() {
  const [showEnterPurchase, setShowEnterPurchase] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateSubCat, setShowCreateSubCat] = useState(false);
  const [edit, setEdit] = useState(false);

  
  const [categories, setCats] = useState([])
  const [subcategories, setSubs] = useState([])


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
       <button onClick={() => setShowCreateSubCat(prev => !prev)}>Create SubCategory</button>
       <button onClick={() => setEdit(!edit)}> {edit ? "Edit Off" : "Edit"}</button>
       <button onClick={logout}>Logout</button>
      </div>
      
      {showEnterPurchase && <div className="EnterPurchase">
        <EnterPurchase 
          categories={categories}
          subcategories={subcategories}
          edit={edit}
        />
      </div>}

      {showCreateCategory && <div className="CreateCategory">
        <CreateCategory
          categories={categories}
          setCats={setCats}
           />
      </div>}

      {showCreateSubCat && <div className="CreateSubCat">
        <CreateSubCat
          subcategories={subcategories}
          setSubs={setSubs}
           />
      </div>}

      <div className="Page">  
        { <TableView
          categories={categories}
          subcategories={subcategories}
          setCats={setCats}
          setSubs={setSubs}
          edit={edit}
         /> }
      </div>
      
    </div>
  )
}

export default App;
