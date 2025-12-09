export function EnterDataButtons(props) {
    const { setShowTable, setShowList, setShowEnterPurchase, setShowCreateCategory, setShowCreateSubCat, setShowDataButtons } = props;

    return (
        <div className="EnterDataButtons">
            <button onClick={() => { setShowEnterPurchase(prev => !prev); setShowCreateCategory(false); setShowCreateSubCat(false); setShowDataButtons(false); }}>Enter Purchase</button>
            <button onClick={() => { setShowCreateCategory(prev => !prev); setShowEnterPurchase(false); setShowCreateSubCat(false); setShowDataButtons(false); }}>Create Category</button>
            <button onClick={() => { setShowCreateSubCat(prev => !prev); setShowEnterPurchase(false); setShowCreateCategory(false); setShowDataButtons(false); }}>Create SubCategory</button>
        </div>
    );
}