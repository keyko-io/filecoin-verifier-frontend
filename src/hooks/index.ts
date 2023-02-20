import { useEffect, useState } from "react";

export const useInitialLargeRequest = (largeClientRequests: any[]) => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    const dataLarge = largeClientRequests
      .map((item: any) => ({
        ...item,
        data: item.data.name,
        searchBy: `${item?.data?.name} ${item?.issue_number} ${item?.multisig} ${item?.address} ${item?.datacap} ${item?.tx?.id}`,
      }))
      .map((item: any) => (item.tx !== null ? item : { ...item, tx: "" }));
    setData(dataLarge);
  }, [largeClientRequests]);

  return data;
};
