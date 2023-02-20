import { useEffect } from "react";

const useSearch = () => {
  // useEffect(() => {
  //     if (context.searchString) {
  //       setDataForLargeRequestTable((prev: any) =>
  //         prev.filter((item: any) =>
  //           item.searchBy
  //             .toLowerCase()
  //             .includes(context.searchString.toLowerCase())
  //         )
  //       );
  //       setSearched(true);
  //     }
  //     if (context.searchString === "" && context.largeClientRequests) {
  //       const data = context.largeClientRequests
  //         .map((item) => ({
  //           ...item,
  //           data: item.data.name,
  //           searchBy: `${item?.data?.name} ${item?.issue_number} ${item?.multisig} ${item?.address} ${item?.datacap} ${item?.tx?.id}`,
  //         }))
  //         .map((item) => (item.tx !== null ? item : { ...item, tx: "" }));
  //       setDataForLargeRequestTable(data);
  //     }
  //   }, [context.searchString, context.largeClientRequests]);
};

export default useSearch;
