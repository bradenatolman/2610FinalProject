import "./enterPurchase.css";
import { useState, useEffect } from "react";

export function CreateCategory() {
    const [subcategories, setSubcategories] = useState([]);
    const [subcategoryName, setSubcategoryName] = useState("");

    useEffect(() => {
        async function fetchSubcategories() {
            const res = await fetch("/categories/", {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            setSubcategories(body.subcategories || []);
        }
        fetchCategories();
        fetchSubcategories();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        const name = subcategoryName.trim();
        if (!name) return;

        // For now: add locally for immediate feedback.
        // Optionally POST to server here if you have an endpoint.
        setSubcategories(prev => [...prev, { id: Date.now(), name }]);
        setSubcategoryName("");
    }

    return (
        <div className="CreateSub">
            <h2>Create Subcategory</h2>
            <form onSubmit={handleSubmit}>
                <label>Category Name:
                    <input
                        type="text"
                        name="subcategoryName"
                        required
                        value={categoryName}
                        onChange={e => setSubcategoryName(e.target.value)}
                    />
                </label>
                <button type="submit">Create</button>
            </form>

            <h3>Existing Categories</h3>
            <ul>
                {subcategories.map(cat => (
                    <li key={cat.id || cat.category || cat.name}>{cat.name || cat.category}</li>
                ))}
            </ul>
        </div>
    );
}