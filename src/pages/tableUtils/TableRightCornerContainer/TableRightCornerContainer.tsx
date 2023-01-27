import "./TableRightCornerContainer.scss"

export interface TableRightCornerContainerProps {
  children: React.ReactNode
}

const TableRightCornerContainer = ({ children }: TableRightCornerContainerProps) => {
  return (
    <div className='tableRightCorner_container'>{children}</div>
  )
}

export default TableRightCornerContainer


