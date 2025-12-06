import "./listView.css";
import React, { useState, useEffect } from "react";
import * as cookie from "cookie";

export function ListView(props) {
    const { categories, subcategories, setCats, setSubs, edit } = props;
    const [ purchases, setPurchases] = useState([]);
    const [ purchaseItems, setPurchaseItems ] = useState([]);
    const [ year, setYear ] = useState(new Date().getFullYear());
    const [ month, setMonth ] = useState(new Date().getMonth() + 1); // Months are 0-indexed

    useEffect(() => {
        async function fetchPurchases() {
            const res = await fetch(`/purchases/`, {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            const raw = body.purchases || [];
            // sort purchases by date descending (newest first). Guard against missing dates.
            raw.sort((a, b) => {
                const da = a.date ? new Date(a.date) : new Date(0);
                const db = b.date ? new Date(b.date) : new Date(0);
                return db - da;
            });
            const filtered = raw.filter(p => p.total != 0);
            console.log("Fetched purchases:", filtered);
            setPurchases(filtered || []);
        }
        async function fetchPurchaseItems() {
            const res = await fetch(`/purchaseItems/`, {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            const raw = body.purchaseItems || [];
            // Optionally, sort purchase items if needed
            const filtered = raw.filter(e => e.amount != 0);
            console.log("Fetched purchase items:", filtered);
            setPurchaseItems(filtered || []);
        }
        fetchPurchases();
        fetchPurchaseItems();
    }, []);

    function handleEdit(purchaseId) {
        // Implement edit functionality here
    }

    function handleDelete(purchaseId) {
        if (!window.confirm("Delete this purchase and all its items?")) return;
        (async () => {
            try {
                const res = await fetch(`/purchases/${purchaseId}/`, {
                    method: "DELETE",
                    credentials: "same-origin",
                    headers: { "X-CSRFToken": cookie.parse(document.cookie).csrftoken }
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    alert(body.error || "Failed to delete purchase");
                    return;
                }
                // remove from local state
                setPurchases(prev => prev.filter(p => p.id !== purchaseId));
                setPurchaseItems(prev => prev.filter(pi => (pi.purchaseId ? pi.purchaseId !== purchaseId : pi.purchase !== purchaseId)));
            } catch (err) {
                console.error(err);
                alert('Network error deleting purchase');
            }
        })();
    }
    

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
                        <React.Fragment key={purchase.id}>
                            <tr>
                                <td>{purchase.date}</td>
                                <td>{purchase.description}</td>
                                <td>{purchase.total}</td>
                                {edit && <td>
                                    <button onClick={() => handleEdit(purchase.id)}>Edit</button>
                                    <button onClick={() => handleDelete(purchase.id)}>Delete</button>
                                </td>}
                            </tr>
                            {purchaseItems
                                .filter(pi => (pi.purchaseId ? pi.purchaseId === purchase.id : pi.purchase === purchase.id))
                                .map(pi => {
                                    const catId = pi.categoryId ?? pi.category;
                                    const subId = pi.subcategoryId ?? pi.subcategory;
                                    const cat = (categories || []).find(c => c.id === catId) || {};
                                    const sub = (subcategories || []).find(s => s.id === subId) || {};
                                    const catName = pi.categoryName || cat.name || "";
                                    const subName = pi.subcategoryName || sub.name || "";
                                    const amount = pi.amount != null ? pi.amount : pi.amount === 0 ? 0 : "";
                                    return (
                                        <tr key={`item-${pi.id}`} className="purchase-item-row">
                                            <td></td>
                                            <td>{catName}{subName ? ` / ${subName}` : ""}</td>
                                            <td>{amount}</td>
                                            {edit && <td>
                                                <button onClick={() => handleEdit(purchase.id)}>Edit</button>
                                                <button onClick={() => handleDelete(purchase.id)}>Delete</button>
                                            </td>}
                                        </tr>
                                    )
                                })}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}