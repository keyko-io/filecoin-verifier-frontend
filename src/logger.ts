import * as Sentry from "@sentry/react";

export const BasicLogger = async ({
    message,
}: {
    message: string;
}): Promise<boolean> => {
    try {
        if (process.env.NODE_ENV === "development") {
            return false;
        }
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
        if (process.env.NODE_ENV === "development") {
            return false;
        }
        await Sentry.configureScope(function (scope) {
            scope.setTag("githubUsername", data.githubUsername);
        });
        return true;
    } catch (error) {
        return false;
    }
};
