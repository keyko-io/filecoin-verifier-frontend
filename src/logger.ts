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
