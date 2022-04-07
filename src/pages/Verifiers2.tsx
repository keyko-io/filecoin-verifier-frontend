import React, { useState } from 'react'
import DataTable from "react-data-table-component";
import Header from '../components/Header';
import Welcome from '../components/Welcome';
import { data , Verifier} from './mockData/fakeData';
import MakeRequestModal from '../modals/MakeRequestModal';
import WarnModal from '../modals/WarnModal';
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";

 const columns: any = [
  {
    name: "Notary Name",
    selector: (row : Verifier) => row.name,
    sortable: true,
  },
  {
    name: "Use Case",
    selector: (row: Verifier) => row.use_case,
    sortable: true, 
    cell: (row : Verifier)=> <span>{row.use_case.join(", ")}</span>
  },
  {
    name: "Location",
    selector: (row: Verifier) => row.location,
    sortable: true,
  },
  {
    name: "Contacts",
    selector: (row : Verifier) => [row.fil_slack_id, row.github_user],
    sortable: false, 
    cell: (row : Verifier)=> (
      <div style={{ display : "flex" , flexDirection: "column" }}>
       <span >Slack : {row.fil_slack_id}</span>
       <span>Github : {row.github_user}</span>
      </div>  
    ) 
  }
];

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

  function search(rows :any) {
       return rows.filter(
          (row: any) =>
            row.name.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
            row.use_case.toString().toLowerCase().indexOf(query.toLowerCase()) > -1 ||
            row.location.toLowerCase().indexOf(query.toLowerCase()) > -1 ||
            row.github_user.toString().toLowerCase().indexOf(query.toLowerCase()) > -1 || 
            row.fil_slack_id.toLowerCase().indexOf(query.toLowerCase()) > -1
       )
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
        
        <div style={{minHeight: "520px", position : "relative" , width : "90%", margin: "0 auto" , border : "1px solid #0091ff" , marginTop : "220px"}}>   
          <div style={{ position : "absolute" , zIndex :"1" , right : "0px" , top : "25px"}}>
            <button onClick={() => contactVerifier()} style={{ fontSize: "14px" , cursor : "pointer", marginRight : "15px",color : "#fff" , backgroundColor : "#0091ff", border : "none" , boxShadow : "rgb(0 0 0 / 35%) 0px 1px 4px", padding : "12px 10px" , borderRadius : "4px", fontWeight : "bold"}}>Make Request</button>
            <a href="https://github.com/filecoin-project/filecoin-plus-client-onboarding" rel="noopener noreferrer" target="_blank" style={{ textDecoration : "none", fontSize: "14px" ,cursor : "pointer",marginRight : "15px",color : "#0091ff" , backgroundColor : "#fff", border : "none" , boxShadow : "rgb(0 0 0 / 35%) 0px 1px 4px", padding : "12px 10px" , borderRadius : "4px" , fontWeight : "bold"}}>Learn more</a>
            <input style={{boxShadow: "0 1px 4px rgb(0 0 0 / 15%), inset 0 0 0 1px #b2b2b2"
            ,border: 0, paddingLeft: "20px", borderRadius : "4px", marginRight : "15px",height : "40px", boxSizing : "border-box"}} placeholder='Search' type="text" value={query} onChange={e => setQuery(e.target.value)}/>
          </div>
        <DataTable
           title="Select Notary, Send Request"
           selectableRows
           selectableRowsNoSelectAll={true}
           noContextMenu={true}
           selectableRowsHighlight={true}
           selectableRowsSingle={true}
           columns={columns}
           data={search(data)}
           pagination 
           paginationRowsPerPageOptions={[7]}
           paginationPerPage={7}  
           onSelectedRowsChange={({selectedRows}) => setSelectedData(selectedRows[0])}
        />
        </div>  
    </div>
  )
}

export default Verifiers2