import { ISSUE_LABELS } from "filecoin-verfier-common";
import { NotaryActionStatus, SentryDataPeriods } from "./type";

export const constructNewStatusComment = (
    status: NotaryActionStatus,
    reason: string,
    freeText: string
): string => {
    if (status === "Decline") {
        return `I have reviewed and I will not support due to: 
                - ${reason}
                ${freeText}`;
    }
    if (status === "Request More Information") {
        return `I have reviewed but am not ready to support yet. There is insufficient information about: 
                - ${reason}
                ${freeText}`;
    }
    return "";
};

export const NOTARY_DECLINE_REASONS = [
    "Conflict of interest",
    "Not in my expertise or domain",
    "Outside my regional jurisdiction",
    "Requested amount does not match dataset",
    "Client deal-making behavior does not match stated allocation strategy",
    "Client did not provide information about the Storage Providers they are working with",
    "Fil+ data distribution noncompliance (Incorrect SPs that client stated that they would work with in their application)",
    "False information that was provided from application",
    "Other reason",
];

export const NOTARY_REQUEST_MORE_INFO_REASONS = [
    "Data Samples",
    "Why the client requires the requested amount of DataCap",
    "The legitimacy of the client or the associated business",
    "The legitimacy of the data that the client is storing",
    "Who the client plans to store their data with and where they are located",
    "Other reason",
];

export const NOTARY_LDN_STATE_CONTROL = [
    "Decline",
    "Request More Information",
];

export const STATUS_LABELS: any = {
    Decline: [ISSUE_LABELS.ONE_NOTARY_DECLINED],
    "Request More Information": [
        ISSUE_LABELS.WAITING_FOR_CLIENT_REPLY,
    ],
};

export const METRICES_TITLES: any = {
    ghLogins: "Github Logins",
    ledgerLogins: "Ledger Logins",
    ghTokenLoading: "Github Token Loaded",
    requestProposed: "Request Proposed",
    requestApproved: "Request Approved",
    proposalFailed: "Proposal Failed",
    approvalFailed: "Approval Failed",
    ledgerLoginsFail : "Ledger Login Failed"
};

export const METRICES_TIME_RANGE_OPTIONS = [
    {
        value: SentryDataPeriods.OneDay,
        label: "1 Day",
    },
    {
        value: SentryDataPeriods.SevenDays,
        label: "7 Days",
    },
    {
        value: SentryDataPeriods.TwoWeeks,
        label: "14 days",
    },
];
