import React  from "react";

export const columns: any = [
    {
      name: "Storage Provider",   
      selector: (row : any) => row.name,
      sortable: true,
      
    },
    {
      name: "Location",   
      selector: (row : any) => row.location,
      sortable: true, 
    },
    {
      name: "Provider ID",    
      selector: (row : any) => row.minerId,
      sortable: true,
    },
    {
      name: "Contact Info",
      selector: (row: any) => row.contacts.slack,
      sortable : true ,
      cell: (row : any)=> <span>Slack: {row.contacts.slack}</span>
    },
    {
      name : "Last Price for Verified Deals",
      sortable : true,
      selector: (row: any) => row.verifiedPrice
    },
    {
        name: "Min Piece Size",
        sortable: true,
        selector : (row: any) => row.minPieceSize
    },
    {
        name : "Reputation Score",
        sortable: true,
        selector: (row : any) => row.reputationScore,
        cell: (row : any)=> <div>
        <span>{row.reputationScore}</span>  
        {row.reputationScore !==  "not found" &&  
         <a 
          style={{ textDecoration : "none", color : "black"}}
          target={"_blank"}
          rel="noopener noreferrer"
          href={`https://filrep.io/?search=${row.minerId}`}>
          <svg 
            style={{transform: "translate(4px,4px"}}
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up-right-square" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707l-4.096 4.096z"/>
          </svg>
          </a> }
        </div>
    }
];