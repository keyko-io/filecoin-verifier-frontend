import './TableContainer.scss'

export interface TableContainerProps {
  children: React.ReactNode
}

const TableContainer = ({ children }: TableContainerProps) => {
  return <div className="table-container">{children}</div>;
};

export default TableContainer;

