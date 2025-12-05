import "./enterPurchase.css";
import { useState, useEffect } from "react";
import * as cookie from "cookie";

export function CreateSubCat(props) {
    const { subcategories, setSubs } = props;
    const [ categories, setCategories ] = useState([]);
    const [ category, setCategory ] = useState(null);
    const [ subcategoryName, setSubcategoryName] = useState("");

    useEffect(() => {
        async function fetchCategories() {
            const res = await fetch("/categories/", {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            setCategories(body.categories || []);
        }
        async function fetchSubcategories() {
            const res = await fetch("/subCategories/", {
                credentials: "same-origin",
            });
            if (!res.ok) return;
            const body = await res.json();
            setSubs(body.subcategories || []);
        }
        fetchCategories();
        fetchSubcategories();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        const name = subcategoryName.trim();
        if (!name || !category) {
            alert('Please select a category and enter a subcategory name');
            return;
        }

        try {
            const res = await fetch('/subCategories/', {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': cookie.parse(document.cookie).csrftoken },
                body: JSON.stringify({ category, name })
            });

            const body = await res.json().catch(() => ({}));
            if (res.ok) {
                // Use returned list if provided, otherwise append created category
                if (body.subcategories) {
                    setSubs(body.subcategories);
                } else if (body.subcategory) {
                    setSubs(prev => [...prev, body.subcategory]);
                }
                setSubcategoryName("");
            } else {
                alert(body.error || 'Failed to create subcategory');
            }
        } catch (err) {
            console.error(err);
            alert('Network error creating subcategory');
        }
    }

    return (
        <div className="CreateSub">
            <h2>Create Subcategory</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Category:
                    <select
                        value={category || ""}
                        onChange={e => setCategory(e.target.value ? parseInt(e.target.value) : null)}
                        required
                    >
                        <option value="" disabled>Select category</option>
                        {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name || cat.category}
                        </option>
                        ))}
                    </select>
                </label>
                <label>Subcategory Name:
                    <input
                        type="text"
                        name="subcategoryName"
                        required
                        value={subcategoryName}
                        onChange={e => setSubcategoryName(e.target.value)}
                    />
                </label>
                <h3>Existing Subcategories</h3>
                {category ? (
                    <ul>
                        {subcategories
                            .filter(s => {
                                // handle different shapes: s.category (id), s.categoryId, or nested object
                                const catId = s.category ?? s.categoryId ?? (s.category && s.category.id);
                                return Number(catId) === Number(category);
                            })
                            .map(sub => (
                                <li key={sub.id || sub.name || sub.subcategory}>{sub.name || sub.subcategory}</li>
                            ))}
                    </ul>
                ) : (
                    <div className="hint">Select a category to see its subcategories.</div>
                )}
                <button type="submit">Create</button>
            </form>
        </div>
    );
}