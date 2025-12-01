import "./tableView.css";
import { useEffect, useState } from "react";

export function TableView() {
    const [monthName, setMonthName] = useState("");
    const [month, setMonth] = useState(0);
    const [year, setYear] = useState(0);
    const [categories, setCats] = useState([])
    const [subcategories, setSubs] = useState([])


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
    }

    useEffect(() => {
        getTableInfo();
    }, [month])

    return (
         <div>  
            <div className="title-month">
                <h1> 
                    <span onClick={() => setMonth(month+1)}> 〈 </span>
                    {monthName} {year}
                    <span> 〉</span></h1>
            </div>
            <div className="categories-grid">
                {categories.map(cat => {
                    const subsForCat = subcategories.filter(s => s.categoryId === cat.id);
                    return (
                        <div key={cat.id} className="category-cell">
                            {subsForCat.length ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{cat.name}</th>
                                            <th>Expected</th>
                                            <th>Actual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subsForCat.map(sub => (
                                            <tr key={sub.id}>
                                                <td>{sub.name}</td>
                                                <td>{sub.amount ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <button>Add Subcategory</button>
                            )}
                        </div>
                    );
                })}
            </div>
        
         </div>
    );
}