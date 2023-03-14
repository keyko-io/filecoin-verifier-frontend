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
    name: 'Address',
    selector: (row: any) => row.data.address,
  },
  {
    name: 'Notary',
    selector: (row: any) => row.data.notary,
  },
  {
    name: 'Datacap',
    selector: (row: any) => row.data.datacap,
  },
  {
    name: 'State',
    selector: (row: any) => row.state,
  },
  {
    name: 'Link',
    selector: (row: any) => row.number,
    cell: (row: any) => (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={row.url}
      >
        #{row.number}
      </a>
    ),
  },
  {
    name: 'Date',
    selector: (row: any) => row.created_at,
    cell: (row: any) => <span>{row.created_at.split('T')[0]}</span>
  },
]

const ClientDetails = () => {
  const context = useContext(Data)
  const [details, setDetails] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [clientInfo, setClientInfo] = useState<ClientInfoStateType>({
    client: '',
    user: '',
    address: '',
    datacap: '',
  })

  useEffect(() => {
    if (!history.location.state) {
      history.push('/')
    }

    setClientInfo(history.location.state as ClientInfoStateType)
    loadDetails()
  }, [])

  const loadDetails = async () => {
    setLoading(true)
    const clientDetailsData = await context.searchUserIssues(clientInfo.user)
    setDetails(clientDetailsData)
    setLoading(false)
  }



  return (
    <div style={{ maxWidth: '1280px', margin: 'auto', width: '100%', marginTop: '4.4rem', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '180px', justifyContent: 'space-around', marginBottom: '1.5rem' }}>
        <h4 style={{ fontWeight: 'normal', fontSize: '1.2rem' }}> Overview - <span style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>{clientInfo.client} </span> </h4>
        <div style={{ fontWeight: 'normal', fontSize: '1.2rem' }}>Github user - @{clientInfo.user}</div>
        <div style={{ fontWeight: 'normal', fontSize: '1.2rem' }}>
          Request Data - Client: {clientInfo.client} , Address: {clientInfo.address} , Datacap: {clientInfo.datacap}
        </div>
      </div>
      {loading ? <div style={{ minHeight: '700px' }}> Loading...</div> : <DataTable
        columns={clientDetailsColumns}
        data={details}
        pagination
        paginationRowsPerPageOptions={[10, 20, 30]}
        paginationPerPage={10}
        noDataComponent="No client requests yet"
      />}
    </div>
  );

}

export default ClientDetails;



