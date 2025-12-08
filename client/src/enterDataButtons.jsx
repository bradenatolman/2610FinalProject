export function EnterDataButtons(props) {
    const { setShowTable, setShowList, setShowEnterPurchase, setShowCreateCategory, setShowCreateSubCat } = props;

    return (
        <div className="EnterDataButtons">
            <button onClick={() => {setShowEnterPurchase(prev => !prev); setShowCreateCategory(false); setShowCreateSubCat(false);}}>Enter Purchase</button>
            <button onClick={() => {setShowCreateCategory(prev => !prev); setShowEnterPurchase(false); setShowCreateSubCat(false);}}>Create Category</button>
            <button onClick={() => {setShowCreateSubCat(prev => !prev); setShowEnterPurchase(false); setShowCreateCategory(false);}}>Create SubCategory</button>
        </div>
    );
}