import "./tableView.css";
import * as cookie from "cookie";
import { EditText, EditNum } from "./tableInput.jsx";
import { useEffect, useState } from "react";

export function TableView(props) {
    const { edit, categories, subcategories, setCats, setSubs, changed, setChanged } = props;
    const [budgets, setBudgets] = useState({});
    const [actuals, setActuals] = useState({});
    const [monthName, setMonthName] = useState("");
    const [month, setMonth] = useState({month: 0, year: 0});
    const [showIncomeSummary, setShowIncomeSummary] = useState(false);
    const [objToDel, setObjToDel] = useState({id: null, type: null});

   
    function updateMonth(delta) {
        return () => {
            let newMonth = month.month + delta;
            let newYear = month.year;
            if (newMonth < 1) {
                newMonth = 12;
                newYear -= 1;
            } else if (newMonth > 12) {
                newMonth = 1;
                newYear += 1;
            }
            setMonth({month: newMonth, year: newYear});
            setChanged(!changed);
        }
    }

    function red(a, b, green=false) {    
        if (a-b <0) {
            return "red";
        }
        if (green && a-b > 0) {
            return "green";
        }
        return "black";
    }    

    async function getTableInfo() {
        const res = await fetch(`/tableInfo/${month.year}/${month.month}/`, {
        credentials: "same-origin",
        })

        const body = await res.json();
        setMonth(body.month);
        setMonthName(body.monthName);
        setCats(body.categories);
        setSubs(body.subcategories);
        setBudgets(body.budgets);
        setActuals(body.actuals);
    }

    async function deleteFromDB() {
        console.log("Deleting:", objToDel);
        const res = await fetch(`/delete/`, {
              method: "POST",
              credentials: "same-origin",
              body: JSON.stringify(objToDel), 
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.parse(document.cookie).csrftoken,
              },
            });
            
            setChanged(!changed);
    }

    // Changes Month and displays data for that month
    useEffect(() => {
        getTableInfo();
    }, [changed])

    useEffect(() => {
        if (objToDel.id !== null)
            deleteFromDB();
    }, [objToDel]);

    return (
         <div>  
            <div className="title-month">
                <h1> 
                    <span onClick={updateMonth(-1)}> 〈 </span>
                    {monthName} {month.year}
                    <span onClick={updateMonth(1)}> 〉</span>
                </h1>
            </div>

            <div className="month-summary">
                <table>
                    <thead>
                        <tr>
                            <th>Monthly Budget</th>
                            <th>Expected</th>
                            <th>Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{!edit ? budgets.total_budget : (<EditNum ismonth={true} month={month} id={month.id} number={budgets.total_budget} changed={changed} setChanged={setChanged} />)}</td>
                            <td>
                                {budgets.expected_total || 0}
                            </td>
                            <td>
                                {actuals.actual_total || "-"}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        {showIncomeSummary && (
                        <tr>
                            <td>Income</td>
                            <td>{budgets.income_expected || 0}</td>
                            <td>{actuals.income_actual || "-"}</td>
                        </tr>
                        )}
                        <tr>
                            <td onClick={() => setShowIncomeSummary(!showIncomeSummary)}>
                                 <u>Difference</u>
                            </td>
                            <td style={{color: red(budgets.income_expected, budgets.expected_total, true)}}>
                                {(budgets.income_expected || 0) - (budgets.expected_total || 0)}
                            </td>
                            <td style={{color: red(actuals.income_actual, actuals.actual_total, true)}}>
                                {(actuals.income_actual || 0) - (actuals.actual_total || 0)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="table-container">
                {categories.map(cat => {
                    const subsForCat = subcategories.filter(s => s.category === cat.id);
                    return (
                        <div key={cat.id} className="category-table">
                            <table>
                                <thead>
                                    <tr>
                                       <th className="left">
                                            {!edit ? ( cat.name ) : ( <span>
                                                {cat.name === "Income" ? "" : (
                                                    <button onClick={() => setObjToDel({type: 'cat', id: cat.id})}>
                                                        <b style={{ color: "red" }}>X</b>
                                                    </button>
                                                )}
                                                <EditText
                                                    id={cat.id}
                                                    type="cat"
                                                    name={cat.name}
                                                    changed={changed}
                                                    setChanged={setChanged}
                                                />
                                                </span>
                                                )
                                            }
                                        </th>
                                        <th>Expected</th>
                                        <th>Actual</th>
                                    </tr>
                                </thead>
                                {subsForCat.length ? (
                                        <tbody>
                                            {subsForCat.map(sub => {
                                                return (
                                                <tr key={sub.id}>
                                                    <td className="left">{!edit ? sub.name : (<span>{(cat.name === "Income" && subsForCat.length<2) ? "" : (
                                                    <button onClick={() => setObjToDel({type: 'sub', id: sub.id})}>
                                                        <b style={{ color: "red" }}>X</b>
                                                    </button>
                                                )}<EditText id={sub.id} type="sub" name={sub.name} changed={changed} setChanged={setChanged} /></span>)}</td>
                                                    <td>{!edit ? budgets[`${sub.id}`] : (<EditNum id={sub.id} number={budgets[`${sub.id}`]} changed={changed} setChanged={setChanged} month={month} ismonth={false} />)}</td>
                                                    
                                                    { cat.name !== 'Income' ? (<td style={{color: red(budgets[`${sub.id}`], actuals[`${sub.id}`])}}>
                                                        {actuals[`${sub.id}`] || "-"}</td>) : (<td>{actuals[`${sub.id}`] || "-"}</td>)}
                                                </tr>
                                            )})}
                                        </tbody>
                                
                                ) : (
                                    <tbody><tr><td>{edit ?(<button>Add Subcategory Above</button>) : '-'}</td><td>-</td><td>-</td></tr></tbody>
                                )}
                                <tfoot>
                                    <tr>
                                        <td className="left">Total</td>
                                        <td>{budgets[`${cat.id}`] || 0}</td>
                                       { cat.name !== 'Income' ? (<td style={{color: red(budgets[`${cat.id}`], actuals[`${cat.id}`])}}>
                                                        {actuals[`${cat.id}`] || "-"}</td>) : (<td>{actuals[`${cat.id}`] || "-"}</td>)}
                                    </tr>
                                </tfoot>
                             </table>
                        </div>
                    );
                })}
            </div>
        
         </div>
    );
}