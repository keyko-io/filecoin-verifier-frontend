import React from "react";
import styled from "styled-components";

const TableContainer = ({ children }: any) => {
  return <TableBox>{children}</TableBox>;
};

export default TableContainer;

const TableBox = styled.div`
  min-height: 520px;
  position: relative;
  width: 90%;
  margin: 0 auto;
  border: 1px solid #0091ff;
  transform: translateY(-30px);
  margin-bottom: 50px;
`;
