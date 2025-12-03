import "./enterPurchase.css";
import { useState, useEffect } from "react";

export function CreateCategory(props) {
    const { categories, setCats } = props;
    const [categoryName, setCategoryName] = useState("");

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch("/categories/", {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            setCategories(body.categories || []);
        }
        fetchCategories();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        const name = categoryName.trim();
        if (!name) return;

        // For now: add locally for immediate feedback.
        // Optionally POST to server here if you have an endpoint.
        setCategories(prev => [...prev, { id: Date.now(), name }]);
        setCategoryName("");
    }

    return (
        <div className="CreateCategory">
            <h2>Create Category</h2>
            <form onSubmit={handleSubmit}>
                <label>Category Name:
                    <input
                        type="text"
                        name="categoryName"
                        required
                        value={categoryName}
                        onChange={e => setCategoryName(e.target.value)}
                    />
                </label>
                <button type="submit">Create</button>
            </form>

            <h3>Existing Categories</h3>
            <ul>
                {categories.map(cat => (
                    <li key={cat.id || cat.category || cat.name}>{cat.name || cat.category}</li>
                ))}
            </ul>
        </div>
    );
}