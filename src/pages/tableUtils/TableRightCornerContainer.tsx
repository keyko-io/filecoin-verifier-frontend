import React from 'react'
import styled from 'styled-components'

const TableRightCornerContainer = ({children}: any) => {
  return (
    <RightCornerBox>{children}</RightCornerBox>
  )
}

export default TableRightCornerContainer


const RightCornerBox = styled.div`
     position: absolute;
     z-index: 1;
     right: 0px;
     top: 25px;
`