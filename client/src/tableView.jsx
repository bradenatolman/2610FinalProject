import "./tableView.css";
import { useEffect, useState } from "react";

export function TableView(props) {
    const { edit } = props;
    const [monthName, setMonthName] = useState("");
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);
    const [categories, setCats] = useState([])
    const [subcategories, setSubs] = useState([])

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
                                                        <td>{sub.amount ?? '-'}</td>
                                                        <td>{sub.actual ?? '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                    
                                    ) : (
                                        <tbody><tr><td>{edit ?(<button>Add Subcategory</button>) : '-'}</td><td>-</td><td>-</td></tr></tbody>
                                    )}
                             </table>
                        </div>
                    );
                })}
            </div>
        
         </div>
    );
}