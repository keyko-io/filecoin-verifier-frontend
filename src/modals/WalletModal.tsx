import { useContext, useState } from 'react';
import { Wallet } from '../context/Wallet/Index'
// @ts-ignore
import { dispatchCustomEvent, H3, Input, ButtonPrimary } from "slate-react-system";

const WalletModal = () => {
  const context = useContext(Wallet)
  const [seedphrase, setSeedPhrase] = useState("")

  const handleImport = () => {
    context.importSeed(seedphrase)
    dispatchCustomEvent({ name: "delete-modal", detail: {} })
  }

  return (
    <div className="accountModal">
      <H3>Import seedphrase</H3>
      <Input
        description=""
        name="seedphrase"
        value={seedphrase}
        placeholder="Enter your seedphrase"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSeedPhrase(e.target.value)}
      />
      <ButtonPrimary onClick={handleImport}>Import</ButtonPrimary>
    </div>
  )
}

export default WalletModal;
