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
        const category = ; // You need to set the category ID or name here
        if (!name || !category) return;

        try {
            const res = await fetch('/categories/', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name,  })
            });

            const body = await res.json().catch(() => ({}));
            if (res.ok) {
                // Use returned list if provided, otherwise append created category
                if (body.categories) {
                    setCategories(body.categories);
                } else if (body.category) {
                    setCategories(prev => [...prev, body.category]);
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