import React from "react";
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import Contacts from "./Contacts/Contacts";
import { MinerData } from "./loadMiners";

export const columns: any = [
  {
    name: "Storage Provider",
    selector: (row: MinerData) => row.name,
    sortable: true,

  },
  {
    name: "Location",
    selector: (row: MinerData) => row.location,
    sortable: true,
  },
  {
    name: "Provider ID",
    selector: (row: MinerData) => row.minerId,
    sortable: true,
  },
  {
    name: "Contact Info",
    selector: (row: MinerData) => row.contacts.slack,
    sortable: true,
    cell: (row: MinerData) => <Contacts slack={row.contacts.slack} href={row.contacts.href} />
  },
  {
    name: "Last Price for Verified Deals",
    sortable: true,
    selector: (row: MinerData) => row.verifiedPrice
  },
  {
    name: "Min Piece Size",
    sortable: true,
    selector: (row: MinerData) => row.minPieceSize,
    sortFunction: (x: any, y: any) => {
      //Custom sort function for minPieceSize

      const a = x.minPieceSizeRaw;
      const b = y.minPieceSizeRaw;

      if (a > b) {
        return 1;
      }

      if (b > a) {
        return -1
      }

      return 0
    }
  },
  {
    name: "Reputation Score",
    sortable: true,
    selector: (row: any) => row.reputationScore,
    cell: (row: any) => <div style={{ display: "flex", fontWeight: "bold", alignItems: "center", color: row.reputationScore > 50 ? "#15803d" : "#ef4444" }}>
      <span>{row.reputationScore}</span>
      {row.reputationScore !== "not found" &&
        <a
          style={{ textDecoration: "none", color: "black" }}
          target={"_blank"}
          rel="noopener noreferrer"
          href={`https://filrep.io/?search=${row.minerId}`}>
          <OpenInNewRoundedIcon style={{ height: "18px", width: "18px" }} />
        </a>}
    </div>
  }
];