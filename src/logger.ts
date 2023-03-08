import * as Sentry from "@sentry/react";

export const BasicLogger = async ({
    message,
}: {
    message: string;
}): Promise<boolean> => {
    try {
        await Sentry.captureMessage(message);
        return true;
    } catch (error) {
        return false;
    }
};

export interface SentryScope {
    githubUsername: string;
}

export const configureScope = async (data: SentryScope) => {
    try {
        await Sentry.configureScope(function (scope) {
            scope.setTag("githubUsername", data.githubUsername);
        });
        return true;
    } catch (error) {
        return false;
    }
};

export const REQUEST_PROPOSED = "Request Proposed"
export const REQUEST_APPROVED = "Request Approved"
export const PROPOSE_CANCELLED = "Propose Cancelled"
export const RKH_SIGN_ON_CHAIN = "Sign On Chain - Notary Application"
export const CLIENT_ALLOCATION_REQUEST = "Client Allocation Request"