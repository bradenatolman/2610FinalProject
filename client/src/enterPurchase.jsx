import "./views.css";
import { useState, useEffect } from "react";
import * as cookie from "cookie";


export function EnterPurchase(props) {
    const { changed, setChanged, categories, setCats, subcategories, setSubs , setShowEnterPurchase} = props;
    // entries: array of { categoryId, subcategoryId, amount }
    const [entries, setEntries] = useState([
        { categoryId: null, subcategoryId: null, amount: "" }
    ]);
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch("/categories/", {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            // Only update parent categories if server returned a non-empty list
            if (Array.isArray(body.categories) && body.categories.length > 0) {
                setCats(body.categories);
            } else {
                // Keep existing parent categories instead of clearing them
                console.debug("/categories/ returned empty list; not overwriting parent categories");
            }
        }
        fetchCategories();
    }, []);
    useEffect(() => {
            async function fetchSubcategories() {
                const res = await fetch("/subCategories/", {
                    credentials: "same-origin",
                });
                if (!res.ok) return;
                const body = await res.json();
                // Only update parent subcategories if server returned a non-empty list
                if (Array.isArray(body.subcategories) && body.subcategories.length > 0) {
                    setSubs(body.subcategories);
                } else {
                    console.debug("/subCategories/ returned empty list; not overwriting parent subcategories");
                }
            }
        fetchSubcategories();
    }, []);
    useEffect(() => {
        async function getDate() {
            const res = await fetch("/today/", {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            setDate(body.today || "");
        }
        getDate();
    }, []);

    function updateEntry(index, patch) {
        setEntries(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
    }

    function addRow() {
        setEntries(prev => [...prev, { categoryId: null, subcategoryId: null, amount: "" }]);
    }

    function removeRow(index) {
        setEntries(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatusMessage(null);

        // Validate entries
        const prepared = entries
            .map(r => ({
                categoryId: r.categoryId ? parseInt(r.categoryId) : null,
                subcategoryId: r.subcategoryId ? parseInt(r.subcategoryId) : null,
                amount: r.amount === "" ? null : parseFloat(r.amount),
                date: date || null,
                notes
            }))
            .filter(r => r.categoryId !== null && r.amount !== null && r.date !== null);

        if (prepared.length === 0) {
            setStatusMessage("Please fill at least one valid entry with category, amount and date.");
            return;
        }

        const res = await fetch("/purchases/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.parse(document.cookie).csrftoken,
            },
            credentials: "same-origin",
            body: JSON.stringify({ entries: prepared }),
        });

        const body = await res.json().catch(() => ({}));
        if (res.ok || res.status === 207) {
            if (body.errors && body.errors.length) {
                setStatusMessage(`Created ${body.created.length} entries, ${body.errors.length} errors.`);
            } else {
                setStatusMessage("All entries created successfully.");
            }
            // reset form rows
            setEntries([{ categoryId: null, subcategoryId: null, amount: "" }]);
            setNotes("");
        } else {
            setStatusMessage(body.error || "Failed to create entries.");
        }
        setChanged(!changed);
    }

    return (
        <div className="enter-purchase-form">
            <h2>Enter Purchases (multiple)</h2>
            <form onSubmit={handleSubmit}>
                {entries.map((entry, idx) => (
                    <div key={idx} className="entry-row">
                        <label>
                            Category:
                            <select
                                value={entry.categoryId || ""}
                                onChange={e => {
                                    updateEntry(idx, { categoryId: e.target.value ? parseInt(e.target.value) : null, subcategoryId: null });
                                }}
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Subcategory:
                            <select
                                value={entry.subcategoryId || ""}
                                onChange={e => updateEntry(idx, { subcategoryId: e.target.value ? parseInt(e.target.value) : null })}
                            >
                                <option value="">(none)</option>
                                 {subcategories
                                    .filter(sub => {
                                        const subCat = sub.category;
                                        return entry.categoryId != null && subCat === entry.categoryId;
                                    })
                                    .map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                                    ))}
                            </select>
                        </label>

                        <label>
                            Amount:
                            <input type="number" step="0.01" value={entry.amount} onChange={e => updateEntry(idx, { amount: e.target.value })} required />
                        </label>

                        <button type="button" onClick={() => removeRow(idx)} className="remove-row">Remove</button>
                    </div>
                ))}

                <div className="form-controls">
                    <label>
                        Date:
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </label>
                    <label>
                        Notes:
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} />
                    </label>
                    <div className="buttons">
                        <button type="button" onClick={addRow}>Add Row</button>
                        <button type="submit" onClick={handleSubmit}>Submit Purchases</button>
                    </div>
                </div>
                {statusMessage && <div className="status">{statusMessage}</div>}
            </form>
            <button onClick={() => props.setShowEnterPurchase(false)}>Close</button>
        </div>
    );
}