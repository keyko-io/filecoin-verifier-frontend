import React, { useState } from 'react';
// @ts-ignore
import Header from '../components/Header';
import { Data } from '../context/Data/Index'
import { config } from '../config'
import { Button, Typography } from '@material-ui/core';



const container = {
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column' as 'column'
}

const SecretTestPage = () => {
  const context = React.useContext(Data)

  const [isLogged, setLogged] = useState(false)
  const [isMessageSent, setIsMessageSent] = useState(false)
  const [messageSentCid, setMessageSentCid] = useState('')
  const [isMessageVerified, setIsMessageVerified] = useState(false)
  const [messagesList, setMessagesList] = useState([])
  const [error, setError] = useState(false)




  const loadLedgerWallet = async () => {
    try {
      const logged = await context.wallet.loadWallet('Burner', {
        multisig: false,
        multisigAddress: ''
      })
      console.log('logged', logged)
      console.log('this.context', context)
      if (logged) setLogged(logged)

    } catch (error) {
      setError(true)
      console.log(error)
    }

  }

  const verifyWallet = async () => {
    try {
      const sending = await context.wallet.api.methods.sendTx(context.wallet.api.client, context.wallet.walletIndex, context.wallet, context.wallet.api.methods.encodeSend(config.secretRecieverAddress, 'ciao'))
      console.log("sending:", sending)
      if (sending['/']) {
        setIsMessageSent(true)
        setMessageSentCid(sending['/'])
      }

    } catch (error) {
      setError(true)
      console.log(error)
    }
  }

  const checkVerifyWallet = async () => {
    try {
      //from, to
      const listMessagesFromToAddress = await context.wallet.api.listMessagesFromToAddress(context.wallet.activeAccount, config.secretRecieverAddress)
      console.log('listMessagesFromToAddress:', listMessagesFromToAddress)
      if (listMessagesFromToAddress.success) {

        setMessagesList(listMessagesFromToAddress.messages)
        setIsMessageVerified(listMessagesFromToAddress.success)
      }
      return listMessagesFromToAddress.success

    } catch (error) {
      setError(true)
      console.log(error)

    }
  }



  return (
    <div style={container}>
      <Header />
      <div style={{position: 'absolute', top:'100px'}}>
      <Typography>Testing wallet verification.</Typography>
      <Typography> At the end, you should be able to send a message with a 'ciao' as a parameter and verify it.</Typography>
      <Typography> You should be able to retrieve your messages on filfox.</Typography>
      </div>

      {(!isLogged && !error) &&
        <>
          <Typography>Click to login With Your Wallet</Typography>
          <Button color='secondary'  variant='outlined'  onClick={() => loadLedgerWallet()}>Login</Button> {/** todo change w ledger wallet */}
        </>
      }
      {(isLogged && !isMessageSent && !error) &&
        <>
          <Typography>Click to send the message from your Wallet</Typography>
          <Button color='secondary'  variant='outlined' onClick={() => verifyWallet()}>Send Message</Button>
        </>
      }
      {(isMessageSent && !isMessageVerified && !error) &&
        <>
          <Typography>Message sent with CID: <a target='_blank' href={`https://filfox.info/en/message/${messageSentCid}`} > {messageSentCid}</a></Typography>
          <Typography>Click again to verify the message </Typography>
          <Button color='secondary'  variant='outlined' onClick={() => checkVerifyWallet()}>Verify Message</Button>
        </>
      }
      {(isMessageVerified && !error) &&
        <>
          <Typography>Message Verified</Typography>
          <Typography>you sent to the recipient address the following msgs: </Typography>
          {
            messagesList.map((item: any) =>
            <a target='_blank' href={`https://filfox.info/en/message/${item['/']}`} >
              <Typography>{item['/']}</Typography>
            </a>)
          }
      </>
      }
      {error &&
        <>
          <Typography>Error: {error} </Typography>

        </>
      }
    </div>
  );
}

export default SecretTestPage;