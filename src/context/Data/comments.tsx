export const notaryLedgerVerifiedComment = (msg:any)=> `## Notary Ledger Verified
#### Message sent to Filecoin Network
> message CID: ${msg}
#### You can check the status of the message here: https://filfox.info/en/message/${msg}`