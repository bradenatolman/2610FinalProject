import "./tableView.css";
import { useEffect, useState } from "react";

export function TableView(props) {
    const { edit, categories, subcategories, setCats, setSubs } = props;
    const [budgets, setBudgets] = useState({});
    const [actuals, setActuals] = useState({});
    const [monthName, setMonthName] = useState("");
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);

    function updateMonth(delta) {
        return () => {
            let newMonth = month + delta;
            let newYear = year;
            if (newMonth < 1) {
                newMonth = 12;
                newYear -= 1;
            } else if (newMonth > 12) {
                newMonth = 1;
                newYear += 1;
            }
            setMonth(newMonth);
            setYear(newYear);
        }
    }

    async function getTableInfo() {
        const res = await fetch(`/tableInfo/${year}/${month}/`, {
        credentials: "same-origin",
        })

        const body = await res.json();
        setMonth(body.month);
        setYear(body.year);
        setMonthName(body.monthName);
        setCats(body.categories);
        setSubs(body.subcategories);
        setBudgets(body.budgets);
        setActuals(body.actuals);

        console.log(body);
    }

    // Changes Month and displays data for that month
    useEffect(() => {
        getTableInfo();
    }, [month])

    // Updates when edited
    useEffect(() => {
        
    }, [categories, subcategories])


    return (
         <div>  
            <div className="title-month">
                <h1> 
                    <span onClick={updateMonth(-1)}> 〈 </span>
                    {monthName} {year}
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
                            <td>{budgets.total_budget || 0}</td>
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
                                        <th>{cat.name}</th>
                                        <th>Expected</th>
                                        <th>Actual</th>
                                    </tr>
                                </thead>
                                {subsForCat.length ? (
                                        <tbody>
                                            {subsForCat.map(sub => (
                                                <tr key={sub.id}>
                                                    <td>{sub.name}</td>
                                                    <td>{budgets[`${sub.id}`] ?? '-'}</td>
                                                    <td>{actuals[`${sub.id}`] ?? '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                
                                ) : (
                                    <tbody><tr><td>{edit ?(<button>Add Subcategory</button>) : '-'}</td><td>-</td><td>-</td></tr></tbody>
                                )}
                                <tfoot>
                                    <tr>
                                        <td>Total</td>
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