import { ISSUE_LABELS } from "filecoin-verfier-common";

export const constructNewStatusComment = (
    status: string,
    reason: string,
    freeText: string
): string => {
    return `Status: ${STATUS_LABELS[status]} 
    Reason: ${reason}
    ${freeText}
    `;
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
