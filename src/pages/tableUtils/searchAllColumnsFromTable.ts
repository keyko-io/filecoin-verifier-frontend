export const searchAllColumnsFromTable = ({ rows , query } : any) => {
    let cols = rows[0] && Object.keys(rows[0])

      return rows.filter((row : any) => {
       
        return  cols.some((col : any)=> row[col].toString().toLowerCase().indexOf(query.toLowerCase()) > -1)
      }    
     )
}