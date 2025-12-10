import "./listView.css";
import React, { useState, useEffect } from "react";
import * as cookie from "cookie";
import { EditItemNum } from "./tableInput";

export function ListView(props) {
    const { categories, subcategories, setCats, setSubs, edit, changed, setChanged } = props;
    const [ purchases, setPurchases] = useState([]);
    const [ purchaseItems, setPurchaseItems ] = useState([]);
    const [ year, setYear ] = useState(new Date().getFullYear());
    const [ month, setMonth ] = useState(new Date().getMonth() + 1); // Months are 0-indexed

    // reloadData fetches purchases and purchaseItems and updates state
    async function reloadData() {
        try {
            const resP = await fetch(`/purchases/`, { credentials: "same-origin" });
            if (resP.ok) {
                const body = await resP.json();
                const raw = body.purchases || [];
                raw.sort((a, b) => {
                    const da = a.date ? new Date(a.date) : new Date(0);
                    const db = b.date ? new Date(b.date) : new Date(0);
                    return db - da;
                });
                const filtered = raw.filter(p => p.total != 0);
                setPurchases(filtered || []);
            }

            const resI = await fetch(`/purchaseItems/`, { credentials: "same-origin" });
            if (resI.ok) {
                const body = await resI.json();
                const raw = body.purchaseItems || [];
                const filtered = raw.filter(e => e.amount != 0);
                setPurchaseItems(filtered || []);
            }
        } catch (err) {
            console.error("Failed to reload purchases/items:", err);
        }
    }

    useEffect(() => {
        reloadData();
    }, [changed]);

    function handleEdit(purchaseId) {
    }

    function handleDelete(purchaseId, type) {
        (async () => {
            try {
                let res;
                if (type === "purchase") {
                    if (!window.confirm("Delete this purchase and all its items?")) return;
                    res = await fetch(`/purchases/${purchaseId}/`, {
                        method: "DELETE",
                        credentials: "same-origin",
                        headers: { "X-CSRFToken": cookie.parse(document.cookie).csrftoken }
                    });
                }else {
                    if (!window.confirm("Delete this entry?")) return;
                    res = await fetch(`/purchaseItems/${purchaseId}/`, {
                        method: "DELETE",
                        credentials: "same-origin",
                        headers: { "X-CSRFToken": cookie.parse(document.cookie).csrftoken }
                    });
                }
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    alert(body.error || "Failed to delete purchase");
                    return;
                }
                // refresh data from server to reflect deletion
                await reloadData();
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
                                    <button onClick={() => handleDelete(purchase.id, "purchase")}>Delete</button>
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
                                            <td>{
                                            !edit ? catName : (
                                                
                                            )
                                            }{subName ? ` / ${subName}` : ""}</td>
                                            <td>{
                                            !edit ? amount : (
                                                <EditItemNum
                                                    number={amount}
                                                    id={pi.id}
                                                    changed={changed}
                                                    setChanged={setChanged}
                                                />
                                            )}</td>
                                            {edit && <td>
                                                <button onClick={() => handleDelete(pi.id, "purchaseItem")}>Delete</button>
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