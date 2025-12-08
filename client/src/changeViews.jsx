export function ChangeViews(props) {
    const { setShowTable, setShowList, setShowEnterPurchase, setShowCreateCategory, setShowCreateSubCat } = props;

    return (
        <div className="EnterDataButtons">
            <button onClick={() => {setShowTable(prev => !prev); setShowList(false); setShowEnterPurchase(false); setShowCreateCategory(false); setShowCreateSubCat(false);}}>Table</button>
            <button onClick={() => {setShowList(prev => !prev); setShowTable(false); setShowEnterPurchase(false); setShowCreateCategory(false); setShowCreateSubCat(false);}}>List</button>
        </div>
    );
}