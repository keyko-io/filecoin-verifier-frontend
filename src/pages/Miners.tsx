import React, { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import Welcome from '../components/Welcome/Welcome'
import TableContainer from './tableUtils/TableContainer/TableContainer';
import TableSearchInput from './tableUtils/TableSearchInput/TableSearchInput';
import TableRightCornerContainer from './tableUtils/TableRightCornerContainer/TableRightCornerContainer';
import { loadData, MinerData } from './tableUtils/loadMiners';
import { columns } from './tableUtils/minersColumns';
import CircularProgress from '@mui/material/CircularProgress';


const Miners = () => {
  const [query, setQuery] = useState<string>('')
  const [miners, setMiners] = useState<MinerData[] | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)


  useEffect(() => {
    const getData = async () => {
      const data = await loadData()
      console.log(data, 'hey')
      setMiners(data)
      setLoading(false)
    }
    getData()
  }, [])

  return (
    <div>
      <Welcome
        title="Welcome to the Filecoin Plus Registry"
        description="Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data."
      />
      <TableContainer>
        <TableRightCornerContainer>
          <TableSearchInput query={query} setQuery={setQuery} />
        </TableRightCornerContainer>
        <DataTable
          title="Search for a Storage Provider"
          columns={columns}
          data={miners as MinerData[]}
          pagination
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationPerPage={10}
          progressPending={loading}
          defaultSortFieldId={7}
          defaultSortAsc={false}
          progressComponent={<CircularProgress style={{ marginTop: '100px' }} />}
        />
      </TableContainer>
    </div>
  )
}

export default Miners