import React,  {useState }  from "react";
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import {CopyToClipboard} from "react-copy-to-clipboard"
import styled from "styled-components"
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';


const ContactsBox = styled.div`
  display: flex;
  align-items: center;

  svg {
    height: 18px;
    width: 18px;
  }

  span:hover {
    color: #0090ff;
  }

  span.active {
    color: #0090ff;
  }
`

const Contacts = ({slack, href} : any) => {
  const [isCopySlack, setIsCopySlack] = useState(false)
  const [isCopyMail, setIsCopyMail] = useState(false)

  
    if(isCopySlack) {
 
       setTimeout(() => {
        setIsCopySlack(false)
       }, 2500)
    }
    
    if(isCopyMail) {
      
      setTimeout(() => {
        setIsCopyMail(false)
      }, 3000)
   }

   return (
       <div style={{ display : "flex" , flexDirection : "column", margin: "6px 0"}}>
       <ContactsBox >
         {isCopySlack ? slack : "Slack"}
         <CopyToClipboard text={slack} onCopy={() => setIsCopySlack(true)}> 
          <span className={isCopySlack ? "active" : ""} style={{ cursor : "pointer"}} >{isCopySlack ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon /> }</span> 
       </CopyToClipboard>
       </ContactsBox>
       {href === undefined ? null : (href.includes("@") ? <ContactsBox >
       {isCopyMail ? href : "Mail"}
         <CopyToClipboard text={href} onCopy={() => setIsCopyMail(true)}> 
          <span className={isCopyMail ? "active" : ""} style={{ cursor : "pointer"}} >{isCopyMail ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon /> }</span> 
       </CopyToClipboard>
       </ContactsBox> : 
        <span style={{ display : "flex" , alignItems : "center" }}>Website 
          <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration : "none", color : "black"}}>
         <LanguageRoundedIcon style={{cursor : "pointer" ,  height: "18px" , width : "18px"}} />
          </a>
        </span>
       ) }
       </div>
      
       
   )
}

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
      cell: (row : any) => <Contacts slack={row.contacts.slack} href={row.contacts.href}/>
    },
    {
      name : "Last Price for Verified Deals",
      sortable : true,
      selector: (row: any) => row.verifiedPrice
    },
    {
        name: "Min Piece Size",
        sortable: true,
        selector : (row: any) => row.minPieceSize,
        sortFunction : (x : any,y : any) => {
           //Custom sort function for minPieceSize
           
           const a = x.minPieceSizeRaw;
           const b = y.minPieceSizeRaw;

           if(a > b) {
              return 1;
           }

           if(b > a) {
             return -1
           }
        
           return 0
        }
    },
    {
        name : "Reputation Score",
        sortable: true,
        selector: (row : any) => row.reputationScore,
        cell: (row : any)=> <div style={{ display: "flex" ,fontWeight: "bold", alignItems : "center", color : row.reputationScore > 50 ? "#15803d" : "#ef4444"}}>
        <span>{row.reputationScore}</span>  
        {row.reputationScore !==  "not found" &&  
         <a 
          style={{ textDecoration : "none", color : "black"}}
          target={"_blank"}
          rel="noopener noreferrer"
          href={`https://filrep.io/?search=${row.minerId}`}>
         <OpenInNewRoundedIcon style={{ height: "18px" , width : "18px"}}/>
          </a> }
        </div>
    }
];