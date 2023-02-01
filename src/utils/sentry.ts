import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

export default function initSentry() {
    Sentry.init({
        dsn: "https://488b3be98a124c008cd88fce8b8abe1c@o933704.ingest.sentry.io/5882860",
        integrations: [new Integrations.BrowserTracing()],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
    });
}


