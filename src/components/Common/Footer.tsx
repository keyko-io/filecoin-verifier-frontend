import React from 'react'
import logo from "../../svg/filecoin-logo.svg"

const Footer = () => {

  return (
    <div className="footer" style={{ marginTop: "auto" }}>
      <div className='logo'>
        <img src={logo} alt="Filecoin" style={{ height: "36px", width: "36px" }} />
        <span>Filecoin <br /> Plus +</span>
      </div>
      <div className='reach_out'>
        <h3>Reach out</h3>
        <div className='reach_out-links'>
          <a href="https://filecoinproject.slack.com/?redir=%2Farchives%2FC01DLAPKDGX" target="_blank" rel="noopener noreferrer">Slack</a>
        </div>
      </div>
      <div className='resources'>
        <h3>Resources</h3>
        <div className='resources-links'>
          <a href="https://docs.filecoin.io/store/filecoin-plus/" target="_blank" rel="noopener noreferrer">Filecoin Plus Documentation</a>
          <a href="https://github.com/filecoin-project/notary-governance" target="_blank" rel="noopener noreferrer">Notary Repository</a>
          <a href="https://github.com/filecoin-project/filecoin-plus-client-onboarding" target="_blank" rel="noopener noreferrer">Client Onboarding</a>
          <a href="https://github.com/filecoin-project/filecoin-plus-large-datasets" target="_blank" rel="noopener noreferrer">Fil+ for Large Datasets</a>
        </div>
      </div>
    </div >
  )
}

export default Footer