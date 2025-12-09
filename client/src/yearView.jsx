import "./views.css";
import { useEffect, useState } from "react";

export function YearView(props) {
    const { showYear } = props;
    const [year, setYear] = useState(2025);
    const [yearInfo, setYearInfo] = useState({missing_months: []});
    const [months, setMonths] = useState([]);
    
    function updateYear(delta) {
        return () => {
            let newYear = year + delta;
            setYear(newYear);
        }
    }

    async function getCurYear() {
        const res = await fetch(`today/`, {
            credentials: "same-origin",
        })
        const body = await res.json();
        setYear(parseInt(body.today.slice(0,4)));
    }

    async function getYearInfo() {
        const res = await fetch(`/yearInfo/${year}/`, {
            credentials: "same-origin",
        })

        const body = await res.json();
        setMonths(body.months);
        setYearInfo(body);
        console.log(body);
    }

    useEffect(() => {
        getCurYear();
    }, [showYear])

    useEffect(() => {
        getYearInfo();
    }, [year])

    return (
         <div>  
            <div className="title-year">
                <h1> 
                    <span onClick={updateYear(-1)}> 〈 </span>
                    {year}
                    <span onClick={updateYear(1)}> 〉</span>
                </h1>
            </div>

            <div className="year-summary">
                <table>
                    <thead>
                        <tr>
                            <th className="left">Yearly Budget</th>
                            <th>Expected</th>
                            <th>Actual</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="left">{yearInfo.total_budget || 0}</td>
                            <td>{yearInfo.expected_total || 0}</td>
                            <td>
                                {yearInfo.actual_total || "-"}
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                         {yearInfo.missing_months.length > 0 && (
                        <tr>
                            <td colSpan={3}>
                                <b>Missing:</b> {yearInfo.missing_months.join(", ")}
                            </td>
                        </tr>
                        )}
                    </tfoot>
                </table>
            </div>

            <div className="table-container">
                    <div className="category-table">
                        <table>
                            <thead>
                                <tr>
                                    <th className="left">Month</th>
                                    <th>Planned</th>
                                    <th>Expected</th>
                                    <th>Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                            {months.map(mon => (
                                <tr key={mon.month.id}>
                                    <td className="left">{mon.monthName}</td>
                                    <td>{mon.planned || 0}</td>
                                    <td>{mon.expected || 0}</td>
                                    <td>{mon.actual || 0}</td>
                                </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="left">Total</td>
                                    <td>{yearInfo.planned_total || 0}</td>
                                    <td>{yearInfo.expected_total || 0}</td>
                                    <td>{yearInfo.actual_total || 0}</td>
                                </tr>
                            </tfoot>
                            </table>
                    </div>
            </div>
        
         </div>
    );
}