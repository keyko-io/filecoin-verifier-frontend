import { useContext } from "react";
import { Data } from "../../../context/Data/Index";

type NotaryTabsProps = {
  tabs: string;
  changeStateTabs: (indexTab: string) => void;
  verifiedClientsLength: number;
};

const NotaryTabs = ({
  changeStateTabs,
  tabs,
  verifiedClientsLength,
}: NotaryTabsProps) => {
  const context = useContext(Data);

  const selectedTab = (tabIndex: string) => {
    return tabs === tabIndex ? "selected" : "";
  };

  return (
    <>
      <div className="tabs">
        <div
          className={selectedTab("1")}
          onClick={() => {
            changeStateTabs("1");
          }}
        >
          Public Requests ({context.clientRequests.length})
        </div>
        <div
          className={selectedTab("2")}
          onClick={() => {
            changeStateTabs("2");
          }}
        >
          Verified clients ({verifiedClientsLength})
        </div>
        <div
          className={selectedTab("3")}
          onClick={() => {
            changeStateTabs("3");
          }}
        >
          Large Requests ({context.rawLargeIssuesAll.length})
        </div>

        <div
          className={selectedTab("4")}
          onClick={() => {
            changeStateTabs("4");
          }}
        >
          Proposed Requests
        </div>
      </div>
    </>
  );
};

export default NotaryTabs;
