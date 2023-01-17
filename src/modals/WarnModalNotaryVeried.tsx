import React from 'react';
// @ts-ignore
import { ButtonPrimary } from "slate-react-system";
import CircularProgress from '@mui/material/CircularProgress';
import { Data } from '../context/Data/Index';
// @ts-ignore
import LoginGithub from "react-login-github";
import { config } from '../config';
import { useContext } from "react";


type WarnModalNotaryVerifiedProps = {
    onClick: () => void;
}

const WarnModalNotaryVerified = ({ onClick }: WarnModalNotaryVerifiedProps) => {
    const { isVerifyWalletLoading, github } = useContext(Data)

    const { oauthUri, githubApp } = config

    return (
        <div className="warnmodalledger">
            {github.githubLogged ? <div className="message" style={{ marginTop: "12px" }}>
                {!isVerifyWalletLoading ? "Hello! Please, to continue, click the button to verify your wallet. You won't have to do this again in the future. Thank you and happy Notarying!" :
                    <div>
                        Please, do not leave the page and wait for the confirmation alert.If the app makes you sign this again, please open a thread  <a href="https://filecoinproject.slack.com/archives/G01HRNU4VBK" target="_blank" rel="noopener noreferrer">here</a>  pasting the address you are using to verify the wallet.
                    </div>
                }
            </div> : <div className="message" style={{ marginTop: "30px" }}>You need to Sign in via Github to be able to approve request.</div>}


            {github.githubLogged ?
                <div className="ledgermessage" > {!isVerifyWalletLoading && <span>Please check your Ledger to sign and send the message.</span>}
                    {!isVerifyWalletLoading ? <ButtonPrimary style={{ marginTop: "12px", minWidth: "130px" }} onClick={() => onClick()}>Verify Wallet</ButtonPrimary>
                        : <ButtonPrimary style={{ marginTop: "12px", minWidth: "130px" }} ><CircularProgress size={20} style={{ color: "white" }} /></ButtonPrimary>}
                </div> : <div id="githublogin">
                    <LoginGithub
                        redirectUri={oauthUri}
                        clientId={githubApp}
                        scope="repo"
                        onSuccess={async (response: any) => {
                            await github.loginGithub(response.code);
                        }}
                        onFailure={(response: any) => {
                            console.log("failure", response);
                        }}
                    />
                </div>}
        </div>
    )
}


export default WarnModalNotaryVerified;


