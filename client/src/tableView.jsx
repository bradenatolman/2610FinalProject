import "./tableView.css";
import { EditText, EditNum } from "./tableInput.jsx";
import { useEffect, useState } from "react";

export function TableView(props) {
    const { edit, categories, subcategories, setCats, setSubs } = props;
    const [changed, setChanged] = useState(false);
    const [budgets, setBudgets] = useState({});
    const [actuals, setActuals] = useState({});
    const [monthName, setMonthName] = useState("");
    const [month, setMonth] = useState({month: 0, year: 0});

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
            month.year = newYear;
            month.month = newMonth;
            setMonth({...month});
            setChanged(!changed);
        }
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

    // Changes Month and displays data for that month
    useEffect(() => {
        getTableInfo();
    }, [changed])

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
                            <th>Planned</th>
                            <th>Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{!edit ? budgets.total_budget : (<EditNum month={true} id={month.id} number={budgets.total_budget} changed={changed} setChanged={setChanged} />)}</td>
                            <td>
                                {budgets.expected_total || 0}
                            </td>
                            <td>
                                {actuals.actual_total || "-"}
                            </td>
                        </tr>
                    </tbody>
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
                                        <th className="left">{!edit ? cat.name : (<EditText id={cat.id} type="cat" name={cat.name} changed={changed} setChanged={setChanged} />)}</th>
                                        <th>Expected</th>
                                        <th>Actual</th>
                                    </tr>
                                </thead>
                                {subsForCat.length ? (
                                        <tbody>
                                            {subsForCat.map(sub => (
                                                <tr key={sub.id}>
                                                    <td className="left">{!edit ? sub.name : (<EditText id={sub.id} type="sub" name={sub.name} changed={changed} setChanged={setChanged} />)}</td>
                                                    <td>{!edit ? budgets[`${sub.id}`] : (<EditNum id={sub.id} number={budgets[`${sub.id}`]} changed={changed} setChanged={setChanged} month={false} />)}</td>
                                                    <td>{actuals[`${sub.id}`] || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                
                                ) : (
                                    <tbody><tr><td>{edit ?(<button>Add Subcategory</button>) : '-'}</td><td>-</td><td>-</td></tr></tbody>
                                )}
                                <tfoot>
                                    <tr>
                                        <td className="left">Total</td>
                                        <td>{budgets[`${cat.id}`] || 0}</td>
                                        <td>{actuals[`${cat.id}`] || 0}</td>
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