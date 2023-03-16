import { ldnParser } from "@keyko-io/filecoin-verifier-tools"
import { config } from "../config"

export const preventDoublePropose = async (
  context: any,
  issueNumber: number
) => {
  const comments = await context.github.githubOcto.paginate(
    context.github.githubOcto.issues.listComments,
    {
      owner: config.onboardingLargeOwner,
      repo: config.onboardingLargeClientRepo,
      issue_number: issueNumber,
    }
  )

  const reversedComments = comments.reverse()

  let proposeComment
  let datacapCommment

  for (let i = 0; i < reversedComments.length; i++) {
    if (reversedComments[i].body.includes("Request Proposed")) {
      proposeComment = reversedComments[i].body
    }
    if (reversedComments[i].body.includes("DataCap Allocation requested")) {
      datacapCommment = reversedComments[i].body
      break
    }
  }

  if (!proposeComment) {
    return false
  }

  const { uuid: datacapId } = ldnParser.parseReleaseRequest(datacapCommment)

  const { uuid: proposeId } =
    ldnParser.parseApprovedRequestWithSignerAddress(proposeComment)

  if (datacapId === proposeId) {
    return true
  }

  return false
}
