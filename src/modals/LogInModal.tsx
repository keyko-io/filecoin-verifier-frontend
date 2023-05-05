import React, { useContext, useState } from "react";
import RootKey from "../svg/root-key.svg";
import Verifiers from "../svg/verifier-wallet.svg";
import Logo from "../svg/logo-button.svg";
import Ledger from "../svg/ledger-logo.svg";
import history from "../context/History";
import { Data } from "../context/Data/Index";
// @ts-ignore
import { ButtonPrimary, dispatchCustomEvent } from "slate-react-system";
import { config } from "../config";
import { CircularProgress } from "@material-ui/core";
import * as Logger from "../logger"

type ModalProps = {
  type: string;
};

const LogInModal = (props: ModalProps) => {
  const context = useContext(Data)

  const [multisig, setMultisig] = useState(false)
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [browserLoading, setBrowserLoading] = useState(false)
  const [address, setAddress] = useState("")

  const loadLedgerWallet = async () => {
    setLedgerLoading(true)
    try {
      const logged = await context.wallet.loadWallet("Ledger", {
        multisig,
        multisigAddress: address,
      });

      if (logged) {
        await Logger.BasicLogger({ message: Logger.LEDGER_LOGIN_SUCCESS })
        setLedgerLoading(false)
        if (context.viewroot === false && props.type === "0") {
          context.switchview();
        }

        dispatchCustomEvent({ name: "delete-modal", detail: {} });

        history.push({
          pathname: "/app",
        });
      } else {
        await Logger.BasicLogger({ message: Logger.LEDGER_LOGIN_FAILED })
      }
    } catch (error) {
      await Logger.BasicLogger({ message: Logger.LEDGER_LOGIN_FAILED })
      console.log(error)
      setLedgerLoading(false)
    }
  };

  const loadBurnerWallet = async () => {
    setBrowserLoading(true)
    try {
      const logged = await context.wallet.loadWallet("Burner", {
        multisig,
        multisigAddress: address,
      });
      if (logged) {
           setBrowserLoading(false)
           await Logger.BasicLogger({ message: Logger.LEDGER_LOGIN_FAILED })
        if (context.viewroot === false && props.type === "0") {
          context.switchview();
        }

        dispatchCustomEvent({ name: "delete-modal", detail: {} });

        history.push({
          pathname: "/app",
        });
      }
    } catch (error) {
      console.log(error)
      setBrowserLoading(false)
    }
  };

  return (
    <div className="loginmodal">
      {props.type === "0" ? (
        <React.Fragment>
          <div className="imgheader">
            <img src={RootKey} alt={"RootKey"} />
          </div>
          <div className="info">
            <div className="title">Log in as a Root Key Holder</div>
            <div className="description">
              Here is where you can action pending Notary allocation
              decisions.To become a rootkey holder, you’ll need to have been
              selected by the network originally.
            </div>
          </div>
          <div className="buttons">
            {config.dev_mode === 'dev' ? (
              <div className="button left">
                <ButtonPrimary onClick={loadBurnerWallet} style={{ minWidth: "220px", boxShadow: "none" }}>
                  {!browserLoading && <img src={Logo} alt={"Logo"} />}
                  {browserLoading ? <CircularProgress size={20} style={{ color: "rgb(0, 144, 255)" }} /> : "Load Browser Wallet"}
                </ButtonPrimary>
              </div>
            ) : null}
            <div
              className={
                config.dev_mode === 'dev'
                  ? "button right"
                  : "button center"
              }
            >
              <ButtonPrimary onClick={loadLedgerWallet} style={{ minWidth: "220px", boxShadow: "none" }}>
                {!ledgerLoading && <img src={Ledger} alt={"Ledger"} />}
                {ledgerLoading ? <CircularProgress size={20} style={{ color: "rgb(0, 144, 255)" }} /> : "Load Ledger Wallet"}

              </ButtonPrimary>
              <p style={{ marginTop: "10px" }}>Please ensure you have “expert mode” enabled</p>
            </div>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="imgheader">
            <img src={Verifiers} alt={"Verifiers"} />
          </div>
          <div className="info">
            <div className="title">Log in as a Notary</div>
            <div className="description">
              Here is where you can manage pending public requests and action
              DataCap allocation decisions. To become a rootkey holder, you’ll
              need to have been preselected.
            </div>
          </div>
          <div className="tabs">
            <div
              className={multisig ? "tab" : "tab selected"}
              onClick={() => setMultisig(false)}
            >
              Individual
            </div>
            {config.dev_mode === 'dev' && (
              <div className={multisig ? "tab selected" : "tab"} onClick={() => setMultisig(true)}>
                Organization
              </div>
            )}
          </div>
          <div className="buttons">
            {config.dev_mode === 'dev' ? (
              <div className="button left">
                <ButtonPrimary onClick={loadBurnerWallet} style={{ minWidth: "220px", boxShadow: "none" }}>
                  {!browserLoading && <img src={Logo} alt={"Logo"} />}
                  {browserLoading ? <CircularProgress size={20} style={{ color: "rgb(0, 144, 255)" }} /> : "Load Browser Wallet"}
                </ButtonPrimary>
                {multisig ? (
                  <input
                    className="multisiginput"
                    name="address"
                    placeholder="Multisig address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                ) : null}
              </div>
            ) : null}
            <div className={config.dev_mode === 'dev' ? "button right" : "button center"}>
              <ButtonPrimary onClick={loadLedgerWallet} style={{ minWidth: "220px", boxShadow: "none" }}>
                {!ledgerLoading && <img src={Ledger} alt={"Ledger"} />}
                {ledgerLoading ? <CircularProgress size={20} style={{ color: "rgb(0, 144, 255)" }} /> : "Load Ledger Wallet"}
              </ButtonPrimary>
              {multisig ? (
                <input
                  className="multisiginput"
                  name="address"
                  placeholder="Multisig address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              ) : null}
              <p style={{ marginTop: "10px" }}>Please ensure you have “expert mode” enabled</p>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

export default LogInModal;
