import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Header from '../components/Header'
import Welcome from '../components/Welcome'
import { searchAllColumnsFromTable } from './tableUtils/searchAllColumnsFromTable';
import TableContainer from './tableUtils/TableContainer';
import TableSearchInput from './tableUtils/TableSearchInput';
import TableRightCornerContainer from './tableUtils/TableRightCornerContainer';
import { loadData } from './tableUtils/loadMiners';
import { columns } from './tableUtils/minersColumns';
import CircularProgress from '@mui/material/CircularProgress';


const Miners = () => {
  const [query, setQuery] = useState<string>("")
  const [miners, setMiners] = useState<any>([])
  const [loading, setLoading] = useState<boolean>(true)


  useEffect(() => {
    const getData = async () => {
      const data = await loadData()
      setMiners(data)
      setLoading(false)
    }
    getData()
  }, [])

  return (
    <div>
      <Header />
      <div className='container'>
        <Welcome
          title="Welcome to the Filecoin Plus Registry"
          description="Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data."
        />
      </div>

      <TableContainer>
        <TableRightCornerContainer>
          <TableSearchInput query={query} setQuery={setQuery} />
        </TableRightCornerContainer>
        <DataTable
          title="Search for a Storage Provider"
          columns={columns}
          data={searchAllColumnsFromTable({ rows: miners, query })}
          pagination
          paginationRowsPerPageOptions={[7]}
          paginationPerPage={7}
          progressPending={loading}
          defaultSortFieldId={7}
          defaultSortAsc={false}
          progressComponent={<CircularProgress style={{ marginTop: "100px" }} />}
        />
      </TableContainer>
    </div>
  )
}

export default Miners