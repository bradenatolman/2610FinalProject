import "./views.css";
import { useState, useEffect } from "react";
import * as cookie from "cookie";

export function CreateCategory(props) {
    const { categories, setCats, setShowCreateCategory } = props;
    const [ categoryName , setCategoryName] = useState("");

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch("/categories/", {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            setCats(body.categories || []);
        }
        fetchCategories();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        const name = categoryName.trim();
        if (!name) return;

        try {
            const res = await fetch('/categories/', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': cookie.parse(document.cookie).csrftoken },
                body: JSON.stringify({ name })
            });

            const body = await res.json().catch(() => ({}));
            if (res.ok) {
                // Use returned list if provided, otherwise append created category
                if (body.categories) {
                    setCats(body.categories);
                } else if (body.category) {
                    setCats(prev => [...prev, body.category]);
                }
                setCategoryName("");
            } else {
                // handle server error (simple alert for now)
                alert(body.error || 'Failed to create category');
            }
        } catch (err) {
            console.error(err);
            alert('Network error creating category');
        }
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
            <button onClick={() => setShowCreateCategory(false)}>Close</button>
        </div>
    );
}