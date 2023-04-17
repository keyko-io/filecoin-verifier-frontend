// all the operations that we have here
export enum SidebarOperationKey {
  MANUAL_DATACAP = "manuel-datacap",
  ISSUE_HISTORY = "issue-history",
  REVIEW_NEEDED = "review-needed",
}

export type historyDataType = {
  comment: any
  commentType: string
  color: string
}
