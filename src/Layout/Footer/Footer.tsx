import React from 'react'
import logo from "../../svg/filecoin-logo.svg"
import "./Footer.scss"

const resourcesLinks = [
  { link: "https://docs.filecoin.io/store/filecoin-plus/", desc: "Filecoin Plus Documentation" },
  { link: "https://github.com/filecoin-project/notary-governance", desc: "Notary Repository" },
  { link: "https://github.com/filecoin-project/filecoin-plus-client-onboarding", desc: "Client Onboarding" },
  { link: "https://github.com/filecoin-project/filecoin-plus-large-datasets", desc: "Fil+ for Large Datasets" }
]

const Footer = () => {
  return (
    <div className="footer" >
      <div className='logo'>
        <img src={logo} alt="Filecoin" />
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
          {resourcesLinks.map(resource => (<a href={resource.link} key={resource.desc} target="_blank" rel="noopener noreferrer">{resource.desc}</a>))}
        </div>
      </div>
    </div >
  )
}

export default Footer
