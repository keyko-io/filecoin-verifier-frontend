import React, { useContext, useEffect, useState } from 'react';
import history from '../context/History'
import DataTable from 'react-data-table-component';
import { Data } from '../context/Data/Index';

type ClientInfoStateType = {
  client: string
  user: string
  address: string
  datacap: string
}

const clientDetailsColumns: any = [
  {
    name: "Address",
    selector: (row: any) => row.data.address,
  },
  {
    name: "Notary",
    selector: (row: any) => row.data.notary,
  },
  {
    name: "Datacap",
    selector: (row: any) => row.data.datacap,
  },
  {
    name: "State",
    selector: (row: any) => row.state,
  },
  {
    name: "Link",
    selector: (row: any) => row.number,
  },
  {
    name: "Date",
    selector: (row: any) => row.created_at,
    cell: (row: any) => <span>{row.created_at.split('T')[0]}</span>
  },
]

const ClientDetails = () => {
  const context = useContext(Data)
  const [details, setDetails] = useState<any>([])
  const [clientInfo, setClientInfo] = useState<ClientInfoStateType>({
    client: "",
    user: "",
    address: "",
    datacap: "",
  })

  useEffect(() => {
    if (!history.location.state) {
      history.push("/")
    }

    setClientInfo(history.location.state as ClientInfoStateType)
    loadDetails()
  }, [])

  const loadDetails = async () => {
    const clientDetailsData = await context.searchUserIssues(clientInfo.user)
    setDetails(clientDetailsData)
  }

  return (
    <div style={{ maxWidth: "1280px", margin: "auto", width: "100%", marginTop: "4.4rem" }}>
      <div>Heyyo</div>
      <DataTable
        columns={clientDetailsColumns}
        data={details}
        pagination
        paginationRowsPerPageOptions={[10, 20, 30]}
        paginationPerPage={10}
        noDataComponent="No client requests yet"
      />
    </div>
  );

}

export default ClientDetails;



