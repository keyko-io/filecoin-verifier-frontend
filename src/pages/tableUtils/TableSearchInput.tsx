import React from 'react'
import styled from "styled-components"

type TableSearchInputProps = {
    query : string,
    setQuery: React.Dispatch<React.SetStateAction<string>>
}

const TableSearchInput = ({query,setQuery}: TableSearchInputProps) => {
  return (
    <InputSearchField  placeholder='Search' type="text" value={query} onChange={e => setQuery(e.target.value)}/>
  )
}

export default TableSearchInput


const InputSearchField = styled.input`
    box-shadow: 0 1px 4px rgb(0 0 0 / 15%), inset 0 0 0 1px #b2b2b2;
    border: 0;
    padding-left : 20px;
    border-radius: 4px;
    margin-right: 15px;
    height: 40px;
    box-sizing: border-box;

`