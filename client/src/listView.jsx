import "./listView.css";
import { useState, useEffect } from "react";

export function ListView(props) {
    const { year, month, edit } = props;
    const [purchases, setPurchases] = useState([]);

    useEffect(() => {
        async function fetchPurchases() {
            const res = await fetch(`/purchases/?year=${year}&month=${month}`, {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            setPurchases(body.purchases || []);
        }
        fetchPurchases();
    }, [year, month]);

    return (
        <div className="ListView">
            <h2>Purchases for {month}/{year}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Total</th>
                        {edit && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {purchases.map(purchase => (
                        <tr key={purchase.id}>
                            <td>{purchase.date}</td>
                            <td>{purchase.description}</td>
                            <td>{purchase.total}</td>
                            {edit && <td>
                                {/* Placeholder for edit/delete actions */}
                                <button>Edit</button>
                                <button>Delete</button>
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}