import { useState } from 'react'
import './App.css'
import { TableView } from './tableView.jsx';
import { YearView } from './yearView.jsx';
import { EnterPurchase } from './enterPurchase.jsx';
import { CreateCategory } from './createCategory.jsx';
import { CreateSubCat } from './createSubCat.jsx';
import { ListView } from './listView.jsx';
import { EnterDataButtons } from './enterDataButtons.jsx';
import { ChangeViews } from './changeViews.jsx';

function App() {
  const [edit, setEdit] = useState(false);
  const [changed, setChanged] = useState(false);

  const [showDataButtons, setShowDataButtons] = useState(false);
  const [showViewButtons, setShowViewButtons] = useState(false);


  const [showEnterPurchase, setShowEnterPurchase] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateSubCat, setShowCreateSubCat] = useState(false);
  
  const [categories, setCats] = useState([])
  const [subcategories, setSubs] = useState([])
  const [showTable, setShowTable] = useState(true);
  const [showList, setShowList] = useState(false);
  const [showYear, setShowYear] = useState(false);


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
      <div className="Navbar" role="navigation">
        <div className="menu-row">
            <div className="toggle-wrap" style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => {setShowViewButtons(prev => !prev); setShowDataButtons(false); }}
                aria-expanded={showViewButtons}
                aria-controls="views-dropdown"
              >
                Views
              </button>

              <div
                id="views-dropdown"
                className={`menu-dropdown dropdown-views ${showViewButtons ? 'open' : ''}`}
                aria-hidden={!showViewButtons}
              >
                <ChangeViews
                  setShowTable={setShowTable}
                  setShowList={setShowList}
                  setShowYear={setShowYear}
                  setShowEnterPurchase={setShowEnterPurchase}
                  setShowCreateCategory={setShowCreateCategory}
                  setShowCreateSubCat={setShowCreateSubCat}
                />
              </div>
            </div>

            <div className="toggle-wrap" style={{ position: 'relative', display: 'inline-block', marginLeft: '8px' }}>
              <button
                onClick={() => { setShowDataButtons(prev => !prev); setShowViewButtons(false); }}

                aria-expanded={showDataButtons}
                aria-controls="data-dropdown"
              >
                Enter Data
              </button>

              <div
                id="data-dropdown"
                className={`menu-dropdown dropdown-data ${showDataButtons ? 'open' : ''}`}
                aria-hidden={!showDataButtons}
              >
                <EnterDataButtons
                  setShowTable={setShowTable}
                  setShowList={setShowList}
                  setShowEnterPurchase={setShowEnterPurchase}
                  setShowCreateCategory={setShowCreateCategory}
                  setShowCreateSubCat={setShowCreateSubCat}
                  setShowDataButtons={setShowDataButtons}
                />
              </div>
            </div>

            <button onClick={() => setEdit(!edit)}>{edit ? 'Edit Off' : 'Edit'}</button>
            <button onClick={logout}>Logout</button>
          </div>
      </div>

      <div className="Page">
          { showEnterPurchase && <EnterPurchase
          changed={changed}
          setChanged={setChanged}
          categories={categories}
          setCats={setCats}
          subcategories={subcategories}
          setSubs={setSubs}
          setShowEnterPurchase={setShowEnterPurchase}
          />
         }
         { showCreateCategory && <CreateCategory
          categories={categories}
          setCats={setCats}
          setShowCreateCategory={setShowCreateCategory}
          />
         }
         { showCreateSubCat && <CreateSubCat
          subcategories={subcategories}
          setSubs={setSubs}
          setShowCreateSubCat={setShowCreateSubCat}
          />
         }

        { showTable && <TableView
          categories={categories}
          subcategories={subcategories}
          setCats={setCats}
          setSubs={setSubs}
          edit={edit}
          changed={changed}
          setChanged={setChanged}
         /> 
        }
         { showList && <ListView 
          categories={categories}
          subcategories={subcategories}
          setCats={setCats}
          setSubs={setSubs}
          edit={edit}
          changed={changed}
          setChanged={setChanged}
          /> }

         { showYear && <YearView
          showYear={showYear} 
          />
         } 
      </div>


      
    </div>
  )
}

export default App;
