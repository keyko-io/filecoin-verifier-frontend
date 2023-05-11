import axios from "axios";
import { config } from "../config";
import { SentryDataPeriods, SentryDataTypes } from "../type";
import { formatSentryURL, isAxiosResponseSuccess } from "../utils";

export const fetchSentryData = async (
    period: SentryDataPeriods,
    type: SentryDataTypes
) => {
    try {
        const url = formatSentryURL(period, type);
        const response = await axios.get(url);
        if (isAxiosResponseSuccess(response)) {
            return response.data;
        }
        return {};
    } catch (error) {
        console.error(error);
        return {};
    }
};

export const fetchOpenBugsCount = async () => {
    try {
        const url = `${config.apiUri}/stats/issues`;
        const response = await axios.get(url);
        if (isAxiosResponseSuccess(response)) {
            return response.data;
        }
        console.log("error");
        console.log(response.status);
        return { count: 0 };
    } catch (error) {
        console.log("error");
        console.log(error);
        return { count: 0 };
    }
};

