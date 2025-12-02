import "./tableView.css";
import { useEffect, useState } from "react";

export function TableView(props) {
    const { edit } = props;
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

        console.log(body);
    }

    useEffect(() => {
        getTableInfo();
    }, [month])

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

    return (
         <div>  
            <div className="title-month">
                <h1> 
                    <span onClick={updateMonth(-1)}> 〈 </span>
                    {monthName} {year}
                    <span onClick={updateMonth(1)}> 〉</span>
                </h1>
            </div>

            <div className="categories-grid">
                {categories.map(cat => {
                    const subsForCat = subcategories.filter(s => s.category === cat.id);
                    return (
                        <div key={cat.id} className="category-cell">
                            {subsForCat.length ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{cat.category}</th>
                                            <th>Expected</th>
                                            <th>Actual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subsForCat.map(sub => (
                                            <tr key={sub.id}>
                                                <td>{sub.subcategory}</td>
                                                <td>{sub.amount ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                (edit && <button>Add Subcategory</button>)
                            )}
                        </div>
                    );
                })}
            </div>
        
         </div>
    );
}