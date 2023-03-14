import { CircularProgress } from '@material-ui/core'
import { useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Data } from '../../../context/Data/Index'
import { ldnParser } from '@keyko-io/filecoin-verifier-tools'

type DataCancelType = {
    clientAddress: string
    clientName: string
    comment: any
    datacap: string
    issueNumber: number
    msig: string
    tx: any
    url?: string
}

export const cancelColumns = [
    {
        name: 'Client Name',
        selector: (row: DataCancelType) => row.clientName,
    },
    {
        name: 'Client Address',
        selector: (row: DataCancelType) => row.clientAddress,
        grow: 2,
    },
    {
        name: 'Issue Number',
        selector: (row: DataCancelType) => row.issueNumber,
        cell: (row: DataCancelType) => (
            <a target='_blank' rel='noopener noreferrer' href={row.url}>
                #{row.issueNumber}
            </a>
        ),
    },
    {
        name: 'TxId',
        selector: (row: DataCancelType) => row.tx.id,
    },
    {
        name: 'Datacap',
        selector: (row: DataCancelType) => row.datacap,
    },
]

type CancelProposalTableProps = {
    setCancelProposalData: any
    dataCancel: DataCancelType[]
    dataCancelLoading: boolean
    setDataCancel: any
}

const CancelProposalTable = ({
    setCancelProposalData,
    dataCancel,
    dataCancelLoading,
    setDataCancel,
}: CancelProposalTableProps) => {
    const context = useContext(Data)

    const [tableDataLoading, setIsTableDataLoading] = useState(false)

    useEffect(() => {
        getPending()
    }, [])

    const getPending = async () => {
        setIsTableDataLoading(true)
        // get issue from the context
        let transactionsData = []

        if (context.txsIssueGitHub) {
            transactionsData = context.txsIssueGitHub
        } else {
            const LDNIssuesAndTransactions: any = await context.getLDNIssuesAndTransactions()
            transactionsData = LDNIssuesAndTransactions.transactionAndIssue.filter(
                (item: any) => item.issue,
            )
        }

        // this is converting id with the short version because we have short version in the array of signers
        // let id = await context.wallet.api.actorAddress(context.wallet.activeAccount) ?  await context.wallet.api.actorAddress(context.wallet.activeAccount) : context.wallet.activeAccount
        let id
        try {
            id = await context.wallet.api.actorAddress(context.wallet.activeAccount)
        } catch (error) {
            id = context.wallet.activeAccount
        }

        const dataByActiveAccount: any = []

        // check if the activeAccount id is in the array
        for (const transaction of transactionsData) {
            if (Array.isArray(transaction.tx)) {
                for (const txId of transaction.tx) {
                    if (txId.signers.includes(id)) {
                        dataByActiveAccount.push(transaction)
                    }
                }
            }
        }

        // manipulate the data for the table and also the cancel function usage
        const DataCancel: DataCancelType[] = dataByActiveAccount.map((item: any) => {
            // getting client name
            const { name } = ldnParser.parseIssue(item.issue[0].issueInfo.issue.body)

            // getting comment with the signer id
            const comment = item.issue[0].issueInfo.comments
                .filter((c: any) => c.body.includes(context.wallet.activeAccount))
                .reverse()

            return {
                clientName: name,
                clientAddress: item.clientAddress,
                issueNumber: item.issue[0].issueInfo.issue_number,
                datacap: item.issue[0].datacap,
                url: item.issue[0].issueInfo.issue.html_url,
                tx: item.tx[0],
                comment: comment[0],
                msig: item.multisigAddress,
            }
        })

        setIsTableDataLoading(false)
        setDataCancel(DataCancel)
    }

    return (
        <div style={{ minHeight: '500px' }}>
            <DataTable
                selectableRows
                selectableRowsHighlight={true}
                selectableRowsSingle={true}
                onSelectedRowsChange={({ selectedRows }) => {
                    setCancelProposalData(selectedRows[0])
                }}
                data={dataCancel}
                columns={cancelColumns}
                noDataComponent="You don't have any pending request yet"
                progressPending={dataCancelLoading || tableDataLoading}
                progressComponent={
                    <CircularProgress style={{ marginTop: '3rem', color: '#0090ff' }} />
                }
            />
        </div>
    )
}

export default CancelProposalTable
