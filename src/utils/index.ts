import { AxiosResponse } from "axios";
import _ from "lodash";
import { config } from "../config";
import { SentryDataTypes } from "../type";

export const groupEventsByDay = (data: { dateCreated: string }[]) => {
    const result = _.groupBy(data, (i) => {
        const d = new Date(i.dateCreated).toDateString().split(" ");
        if (d.length < 3)
            return new Date(i.dateCreated).toDateString(); // just to be safe
        const res = d[1] + "/" + d[2];
        return res;
    });

    return result;
};

export const formatSentryURL = (
    period: string,
    type: SentryDataTypes
) => {
    const baseUrl = `${config.apiUri}/stats/${type}/${period}`;
    return baseUrl;
};

export const filterByLabel = (issues: any, shouldInclude: string) => {
    const i = issues.filter((issue: any) =>
        issue.labels.some((l: any) => {
            return l.name
                .toLowerCase()
                .replace(/ /g, "")
                .includes(shouldInclude);
        })
    );
    return i;
};

export const isAxiosResponseSuccess = (
    response: AxiosResponse<any[]>
): boolean => {
    return response?.status < 300 && response?.status > 199;
};

