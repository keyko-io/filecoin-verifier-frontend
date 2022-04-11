import React, { useState } from 'react'
import DataTable from "react-data-table-component";
import Header from '../components/Header';
import Welcome from '../components/Welcome';
import { data } from './mockData/fakeData';
import MakeRequestModal from '../modals/MakeRequestModal';
import { searchAllColumnsFromTable } from './tableUtils/searchAllColumnsFromTable';
import TableContainer from './tableUtils/TableContainer';
import WarnModal from '../modals/WarnModal';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import TableSearchInput from './tableUtils/TableSearchInput';
import TableRightCornerContainer from './tableUtils/TableRightCornerContainer';
import { columns } from './tableUtils/verifiersColumns';


const Verifiers2 = () => {
  const [selectedData, setSelectedData] = useState<any>(null)
  const [query, setQuery] = useState<string>("")

  
  const contactVerifier = async () => {

    if (selectedData) {
        let verifier: any = selectedData

        dispatchCustomEvent({
            name: "create-modal", detail: {
                id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
                modal: <MakeRequestModal verifier={verifier} />
            }
        })
        return
    }
    
    dispatchCustomEvent({
        name: "create-modal", detail: {
            id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
            modal: <WarnModal message={'Please select one verifier'} />
        }
    })
}

  

  return (
    <div>
        <Header/>
        <div className='container'>
          <Welcome
            title="Welcome to the Filecoin Plus Registry"
            description="Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data."
          />
        </div>
        
        <TableContainer>   
          <TableRightCornerContainer>
            <button onClick={() => contactVerifier()} style={{ fontSize: "14px" , cursor : "pointer", marginRight : "15px",color : "#fff" , backgroundColor : "#0091ff", border : "none" , boxShadow : "rgb(0 0 0 / 35%) 0px 1px 4px", padding : "12px 10px" , borderRadius : "4px", fontWeight : "bold"}}>Make Request</button>
            <a href="https://github.com/filecoin-project/filecoin-plus-client-onboarding" rel="noopener noreferrer" target="_blank" style={{ textDecoration : "none", fontSize: "14px" ,cursor : "pointer",marginRight : "15px",color : "#0091ff" , backgroundColor : "#fff", border : "none" , boxShadow : "rgb(0 0 0 / 35%) 0px 1px 4px", padding : "12px 10px" , borderRadius : "4px" , fontWeight : "bold"}}>Learn more</a>
            <TableSearchInput query={query} setQuery={setQuery} />
          </TableRightCornerContainer>
        <DataTable
           title="Select Notary, Send Request"
           selectableRows
           selectableRowsNoSelectAll={true}
           noContextMenu={true}
           selectableRowsHighlight={true}
           selectableRowsSingle={true}
           columns={columns}
           data={searchAllColumnsFromTable({ rows : data , query})}
           pagination 
           paginationRowsPerPageOptions={[7]}
           paginationPerPage={7}  
           onSelectedRowsChange={({selectedRows}) => setSelectedData(selectedRows[0])}
        />
        </TableContainer>  
    </div>
  )
}

export default Verifiers2