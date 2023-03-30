import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import Welcome from "../components/Welcome/Welcome"
import MakeRequestModal from "../modals/MakeRequestModal"
import TableContainer from "./tableUtils/TableContainer/TableContainer"
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system"
import TableRightCornerContainer from "./tableUtils/TableRightCornerContainer/TableRightCornerContainer"
import { columns } from "./tableUtils/verifiersColumns"
import lodash from "lodash"
import { config } from "../config"
import toast from "react-hot-toast"

export interface Notary {
  id: number
  organization: string
  name: string
  election_round: string
  status: string
  use_case: string
  location: string
  notary_application_link: string
  website: string
  email: string[]
  fil_slack_id: string
  github_user: string[]
  ldn_config: Config
  direct_config: Config
  previous_config: PreviousConfig
  docs_url?: string
  private_request?: string
}

export interface Config {
  active_signer: boolean
  signing_address: string
}

export interface PreviousConfig {
  signing_address: string
}

const base = {
   fontSize: "14px",
   boxShadow: "rgb(0 0 0 / 35%) 0px 1px 4px",
   border: "none",
   padding: "12px 10px",
   borderRadius: "4px",
   fontWeight: "bold",
   cursor: "pointer",
   marginRight: "15px",
}

const buttonStyle = {
  ...base,
  color: "#fff",
  backgroundColor: "#0091ff",
}

const linkStyle = {
  ...base,
  textDecoration: "none",
  color: "#0091ff",
  backgroundColor: "#fff",
}

const Verifiers = () => {
  const [selectedNotary, setSelectedNotary] = useState<Notary | null>(null)
  const [notariesData, setNotariesData] = useState<Notary[]>([])

  useEffect(() => {
    fetch(config.verifiers_registry_url)
      .then((res) => res.json())
      .then((data) => setNotariesData(lodash.shuffle(data.notaries)))
  }, [])

  async function contactVerifier() {
    if (!selectedNotary) {
      toast.error("You should select one verifier")
      return
    }

    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: <MakeRequestModal verifier={selectedNotary} />,
      },
    })
  }

  return (
    <div>
      <div className="container">
        <Welcome
          title="Welcome to the Filecoin Plus Registry"
          description="Filecoin Plus is a layer of social trust on top of the Filecoin Network to help incentivize the storage of real data."
        />
      </div>

      <TableContainer>
        <TableRightCornerContainer>
          <button onClick={() => contactVerifier()} style={buttonStyle}>
            Make Request
          </button>
          <a
            href="https://github.com/filecoin-project/filecoin-plus-client-onboarding"
            rel="noopener noreferrer"
            target="_blank"
            style={linkStyle}
          >
            Learn more
          </a>
        </TableRightCornerContainer>
        <DataTable
          title="Select Notary, Send Request"
          selectableRows
          selectableRowsNoSelectAll={true}
          noContextMenu={true}
          selectableRowsHighlight={true}
          selectableRowsSingle={true}
          columns={columns}
          data={notariesData}
          pagination
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationPerPage={10}
          onSelectedRowsChange={({ selectedRows }) =>
            setSelectedNotary(selectedRows[0])
          }
        />
      </TableContainer>
    </div>
  )
}

export default Verifiers
