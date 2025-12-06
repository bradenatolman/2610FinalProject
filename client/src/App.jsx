import { useState } from 'react'
import './App.css'
import { TableView } from './tableView.jsx';
import { EnterPurchase } from './enterPurchase.jsx';
import { CreateCategory } from './createCategory.jsx';
import { CreateSubCat } from './createSubCat.jsx';
import { ListView } from './listView.jsx';
import { EnterDataButtons } from './enterDataButtons.jsx';
import { ChangeViews } from './changeViews.jsx';

function App() {
  const [edit, setEdit] = useState(false);
  const [showDataButtons, setShowDataButtons] = useState(false);
  const [showViewButtons, setShowViewButtons] = useState(false);


  const [showEnterPurchase, setShowEnterPurchase] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateSubCat, setShowCreateSubCat] = useState(false);
  
  const [categories, setCats] = useState([])
  const [subcategories, setSubs] = useState([])
  const [showTable, setShowTable] = useState(true);
  const [showList, setShowList] = useState(false);


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
      
       <button onClick={() => setShowViewButtons(prev => !prev)}>Views</button>
       {showViewButtons && <ChangeViews
        setShowTable={setShowTable}
        setShowList={setShowList}
        setShowEnterPurchase={setShowEnterPurchase}
        setShowCreateCategory={setShowCreateCategory}
        setShowCreateSubCat={setShowCreateSubCat}
       />}

      
       <button onClick={() => setShowDataButtons(prev => !prev)}>Enter Data</button>
       {showDataButtons && <EnterDataButtons
        setShowTable={setShowTable}
        setShowList={setShowList}
        setShowEnterPurchase={setShowEnterPurchase}
        setShowCreateCategory={setShowCreateCategory}
        setShowCreateSubCat={setShowCreateSubCat}
       />}
       
       
       <button onClick={() => setEdit(!edit)}> {edit ? "Edit Off" : "Edit"}</button>
       <button onClick={logout}>Logout</button>
      </div>
      

      {showEnterPurchase && <div className="EnterPurchase">
        <EnterPurchase 
          categories={categories}
          setCats={setCats}
          subcategories={subcategories}
          setSubs={setSubs}
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
        { showTable && <TableView
          categories={categories}
          subcategories={subcategories}
          setCats={setCats}
          setSubs={setSubs}
          edit={edit}
         /> 
        }
         { showList && <ListView 
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
