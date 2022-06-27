import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Welcome from "../components/Welcome/Welcome";
import MakeRequestModal from "../modals/MakeRequestModal";
import { searchAllColumnsFromTable } from "./tableUtils/searchAllColumnsFromTable";
import TableContainer from "./tableUtils/TableContainer/TableContainer";
import WarnModal from "../modals/WarnModal";
// @ts-ignore
import { dispatchCustomEvent } from "slate-react-system";
import TableSearchInput from "./tableUtils/TableSearchInput/TableSearchInput";
import TableRightCornerContainer from "./tableUtils/TableRightCornerContainer/TableRightCornerContainer";
import { columns } from "./tableUtils/verifiersColumns";
import lodash from "lodash";

import { notaries } from "../data/verifiers-registry.json"

const Verifiers = () => {
  const [selectedData, setSelectedData] = useState<any>(null);
  const [query, setQuery] = useState<string>("");
  const [shuffleData, setShuffleData] = useState(notaries);

  useEffect(() => {
    setShuffleData(lodash.shuffle(shuffleData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contactVerifier = async () => {
    if (selectedData) {
      let verifier: any = selectedData;

      dispatchCustomEvent({
        name: "create-modal",
        detail: {
          id: Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, "")
            .substr(0, 5),
          modal: <MakeRequestModal verifier={verifier} />,
        },
      });
      return;
    }

    dispatchCustomEvent({
      name: "create-modal",
      detail: {
        id: Math.random()
          .toString(36)
          .replace(/[^a-z]+/g, "")
          .substr(0, 5),
        modal: <WarnModal message={"Please select one verifier"} />,
      },
    });
  };

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
          <button
            onClick={() => contactVerifier()}
            style={{
              fontSize: "14px",
              cursor: "pointer",
              marginRight: "15px",
              color: "#fff",
              backgroundColor: "#0091ff",
              border: "none",
              boxShadow: "rgb(0 0 0 / 35%) 0px 1px 4px",
              padding: "12px 10px",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Make Request
          </button>
          <a
            href="https://github.com/filecoin-project/filecoin-plus-client-onboarding"
            rel="noopener noreferrer"
            target="_blank"
            style={{
              textDecoration: "none",
              fontSize: "14px",
              cursor: "pointer",
              marginRight: "15px",
              color: "#0091ff",
              backgroundColor: "#fff",
              border: "none",
              boxShadow: "rgb(0 0 0 / 35%) 0px 1px 4px",
              padding: "12px 10px",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            Learn more
          </a>
          <TableSearchInput query={query} setQuery={setQuery} />
        </TableRightCornerContainer>
        <DataTable
          title="Select Notary, Send Request"
          selectableRows
          selectableRowsNoSelectAll={true}
          noContextMenu={true}
          selectableRowsHighlight={true}
          selectableRowsSingle={true}
          columns={columns}
          data={searchAllColumnsFromTable({
            rows: shuffleData,
            query,
          })}
          pagination
          paginationRowsPerPageOptions={[10, 20, 30]}
          paginationPerPage={10}
          onSelectedRowsChange={({ selectedRows }) =>
            setSelectedData(selectedRows[0])
          }
        />
      </TableContainer>
    </div>
  );
};

export default Verifiers;
