import React from 'react'
import './TableSearchInput.scss'

type TableSearchInputProps = {
  query: string,
  setQuery: React.Dispatch<React.SetStateAction<string>>
}

const TableSearchInput = ({ query, setQuery }: TableSearchInputProps) => {
  return (
    <input className='table-search-input' placeholder='Search' type="text" value={query} onChange={e => setQuery(e.target.value)} />
  )
}

export default TableSearchInput


