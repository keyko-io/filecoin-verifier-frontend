import { useState } from "react";
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { CopyToClipboard } from "react-copy-to-clipboard"
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import "./Contacts.scss"

type ContactProps = { slack: string, href: string }

const Contacts = ({ slack, href }: ContactProps) => {
    const [isCopySlack, setIsCopySlack] = useState(false)
    const [isCopyMail, setIsCopyMail] = useState(false)

    if (isCopySlack) {
        setTimeout(() => {
            setIsCopySlack(false)
        }, 2500)
    }

    if (isCopyMail) {
        setTimeout(() => {
            setIsCopyMail(false)
        }, 3000)
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", margin: "6px 0" }}>
            <div className="contacts-box">
                {isCopySlack ? slack : "Slack"}
                <CopyToClipboard text={slack} onCopy={() => setIsCopySlack(true)}>
                    <span className={isCopySlack ? "active" : ""} style={{ cursor: "pointer" }} >{isCopySlack ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}</span>
                </CopyToClipboard>
            </div>
            {href === undefined ? null : (href.includes("@") ? <div className="contacts-box" >
                {isCopyMail ? href : "Mail"}
                <CopyToClipboard text={href} onCopy={() => setIsCopyMail(true)}>
                    <span className={isCopyMail ? "active" : ""} style={{ cursor: "pointer" }} >{isCopyMail ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}</span>
                </CopyToClipboard>
            </div> :
                <span style={{ display: "flex", alignItems: "center" }}>Website
                    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "black" }}>
                        <LanguageRoundedIcon style={{ cursor: "pointer", height: "18px", width: "18px" }} />
                    </a>
                </span>
            )}
        </div>
    )
}


export default Contacts