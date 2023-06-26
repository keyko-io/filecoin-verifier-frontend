import { useContext, useState } from 'react';
import { Wallet } from '../context/Wallet/Index'
// @ts-ignore
import { dispatchCustomEvent, H3, Input, ButtonPrimary } from "slate-react-system";
import { DataCapRemovalRequest } from '../type';


type ModalProps = {
  removalRequest: DataCapRemovalRequest,
  onClick: (isProposal: boolean,removalRequest: DataCapRemovalRequest,  notary1?: string, signature1?: string, notary2?: string, signature2?: string) => void;
  origin: string,
}

const DataCapRemovalModal = (props: ModalProps) => {
  const isProposal = props.removalRequest.tx ? false : true
  const removalRequest = props.removalRequest
  const [signature1, setSignature1] = useState<string>('')
  const [signature2, setSignature2] = useState<string>('')
  const [notary1, setNotary1] = useState<string>('')
  const [notary2, setNotary2] = useState<string>('')
  if (isProposal) {
    return (
      <div className="accountModal">
        <H3>Propose dataCap removal for client with address: <br /> {removalRequest.address} <br /> Please paste the notaries signatures and addresses in ID format (eg. f0101)</H3>
        <div>

          <Input
            description=""
            name="first notary address"
            placeholder="paste first notary address"
            onChange={(e: any) => setNotary1(e.target.value)}
          />
          <Input
            description=""
            name="first notary signature"
            placeholder="paste first notary signature"
            onChange={(e: any) => setSignature1(e.target.value)}
          />
        </div>

        <div>
          <Input
            description=""
            name="second notary address"
            placeholder="paste second notary address"
            onChange={(e: any) => setNotary2(e.target.value)}
          />
          <Input
            description=""
            name="second notary signature"
            placeholder="paste second notary signature"
            onChange={(e: any) => setSignature2(e.target.value)}
          />
        </div>

        <ButtonPrimary onClick={() => props.onClick(isProposal,removalRequest, notary1, signature1, notary2, signature2)}>{isProposal? "Propose":"Approve"}</ButtonPrimary>
      </div>
    )

  } else {
    return (
      <div className="accountModal">
        <H3>Approve dataCap removal for client with address: <br /> {removalRequest.address}</H3>
        <div>
          <ul>
            <li><strong>Client Name: </strong>{removalRequest.name}</li>
            <li><strong>Client Address: </strong>{removalRequest.address}</li>
            <li><strong>DataCap To Remove: </strong>{removalRequest.datacapToRemove}</li>
            <li><strong>Audit Trail: </strong>{removalRequest.issue_number}</li>
            <li><strong>Tx Id: </strong>{removalRequest.tx?.id}</li>
            <li><strong>Proposer RKH: </strong>{removalRequest.tx?.signers}</li>
            <li><strong>Proposer Notary 1: </strong>{removalRequest.tx?.parsed.params.verifierRequest1.verifier}</li>
            <li><strong>Proposer Notary 2: </strong>{removalRequest.tx?.parsed.params.verifierRequest2.verifier}</li>
          </ul>
        </div>

        <ButtonPrimary onClick={() => props.onClick(isProposal,removalRequest)}>{isProposal? "Propose":"Approve"}</ButtonPrimary>
      </div>
    )

  }
}

export default DataCapRemovalModal;
