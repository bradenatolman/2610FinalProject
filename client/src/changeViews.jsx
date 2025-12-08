export function ChangeViews(props) {
    const { setShowYear, setShowTable, setShowList, setShowEnterPurchase, setShowCreateCategory, setShowCreateSubCat } = props;

    return (
        <div className="EnterDataButtons">
             <button onClick={() => {setShowYear(prev => !prev); setShowList(false); setShowTable(false); setShowEnterPurchase(false); setShowCreateCategory(false); setShowCreateSubCat(false);}}> Year View </button>
            <button onClick={() => {setShowTable(prev => !prev); setShowYear(false); setShowList(false); setShowEnterPurchase(false); setShowCreateCategory(false); setShowCreateSubCat(false);}}>Table</button>
            <button onClick={() => {setShowList(prev => !prev); setShowYear(false); setShowTable(false); setShowEnterPurchase(false); setShowCreateCategory(false); setShowCreateSubCat(false);}}>List</button>
        </div>
    );
}