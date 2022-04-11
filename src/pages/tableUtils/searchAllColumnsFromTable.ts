export const searchAllColumnsFromTable = ({ rows , query } : any) => {
    let cols = rows[0] && Object.keys(rows[0])


    console.log(cols)
  
      return rows.filter((row : any) => 
         cols.some((col : any)=> row[col].toString().toLowerCase().indexOf(query.toLowerCase()) > -1)
     )
}