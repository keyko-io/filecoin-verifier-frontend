/* eslint-disable react-hooks/exhaustive-deps */
import { Box, TextField, Stack, Typography, Button } from "@mui/material"
import { useContext, useState } from "react"
import { Data } from "../context/Data/Index"
import { config } from "../config"
import { ldnParser } from "@keyko-io/filecoin-verifier-tools"
import { toast } from "react-hot-toast"
import { v4 as uuidv4 } from "uuid"
import { LoadingButton } from "@mui/lab"

export const newAllocationRequestComment = (
  address: string,
  amountToRequest: string,
  msigAddress: string,
  requestNumber: string,
  uuid: string
): string => {
  // #### Remaining dataCap\r> ${dataCapRemaining}\r
  return `
## DataCap Allocation requested\r\n
### Request number ${requestNumber}
#### Multisig Notary address\r\n> ${msigAddress}\r\n
#### Client address\r\n> ${address}\r\n
#### DataCap allocation requested\r\n> ${amountToRequest}\r\n
#### Id\r\n> ${uuid}`
}

const initialFormState = {
  issueNumber: "",
  multisig: "",
  dataCap: "",
  requestNumber: "",
  clientAddress: "",
}

const ManualDatacapRequest = () => {
  const context = useContext(Data)

  const [formData, setFormData] = useState(initialFormState)
  const [isLoading, setIsLoading] = useState(false)
  const [isHelperTextShown, setIsHelperTextShown] = useState(false)

  const fillOutForm = async () => {
    if (!formData.issueNumber) {
      toast.error("issue number required")
      return
    }
    const data = await context.github.fetchGithubComments(
      config.onboardingLargeOwner,
      config.onboardingLargeClientRepo,
      Number(formData.issueNumber)
    )

    if (!data) {
      toast.error("something went wrong please try again!")
      return
    }

    const reverseComments = data.reverse()

    const lastDatacapComment = reverseComments.find((comments: any) =>
      comments.body.includes("## DataCap Allocation requested")
    )

    if (!lastDatacapComment) {
      toast.error("no old datacap request info")
      return
    }

    const commentParsed = ldnParser.parseReleaseRequest(lastDatacapComment.body)

    if (!commentParsed.correct) {
      toast.error("last datacap comment has missing information")
      return
    }

    const regex = /### Request number (\d+)/
    const match = lastDatacapComment.body.match(regex)
    let numberOfRequest = Number(match && match[1])

    if (numberOfRequest === 0) numberOfRequest = 1

    setFormData((prev) => ({
      ...prev,
      multisig: commentParsed.notaryAddress,
      clientAddress: commentParsed.clientAddress,
      requestNumber: (numberOfRequest + 1).toString(),
      dataCap: commentParsed.allocationDatacap,
    }))
    setIsHelperTextShown(true)
  }

  const HandleForm = (e: any) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const createRequest = async () => {
    setIsLoading(true)
    setIsHelperTextShown(false)
    const isAnyValueEmpty = Object.values(formData).some(
      (value) => value === ""
    )

    if (isAnyValueEmpty) {
      toast.error("all fields are required")
      setIsLoading(false)
      return
    }

    const commentContent = newAllocationRequestComment(
      formData.clientAddress,
      formData.dataCap,
      formData.multisig,
      formData.requestNumber,
      uuidv4()
    )

    const res = await context.github.githubOcto.issues.createComment({
      owner: config.onboardingLargeOwner,
      repo: config.onboardingLargeClientRepo,
      issue_number: formData.issueNumber,
      body: commentContent,
    })

    if (res.status === 201) {
      setIsLoading(false)
      const LDN_PREFIX_URL = `https://github.com/${config.onboardingOwner}/${config.onboardingLargeClientRepo}/issues/`
      toast.success(
        <div>
          <div>Datacap request successfully created</div>
          <div>
            <a
              href={LDN_PREFIX_URL.concat(formData.issueNumber)}
              target="_blank"
              rel="noreferrer"
            >
              See the issue{" "}
            </a>
          </div>
        </div>,
        {
          duration: 5000,
        }
      )
      setFormData(initialFormState)
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Box sx={{ width: "500px", mt: "10rem" }}>
        <Typography variant="h5" textAlign="center" mb="2rem">
          Create Datacap Request
        </Typography>
        <Stack direction="column" spacing={5}>
          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              label="Issue Number"
              fullWidth
              name="issueNumber"
              onChange={HandleForm}
              value={formData.issueNumber}
            />
            <TextField
              size="small"
              label="Multisig Number"
              fullWidth
              name="multisig"
              onChange={HandleForm}
              value={formData.multisig}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              size="small"
              label="Datacap"
              fullWidth
              name="dataCap"
              onChange={HandleForm}
              value={formData.dataCap}
              helperText={
                isHelperTextShown
                  ? "please adjust datacap field before sending the request"
                  : ""
              }
              FormHelperTextProps={{ sx: { color: "red" } }}
            />
            <TextField
              size="small"
              label="Request Number"
              fullWidth
              name="requestNumber"
              onChange={HandleForm}
              value={formData.requestNumber}
            />
          </Stack>

          <Stack direction="row">
            <TextField
              size="small"
              label="Client Address"
              fullWidth
              name="clientAddress"
              onChange={HandleForm}
              value={formData.clientAddress}
            />
          </Stack>

          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button variant="outlined" onClick={fillOutForm}>
              Fill Out Data
            </Button>
            <LoadingButton
              loading={isLoading}
              variant="contained"
              onClick={createRequest}
            >
              Create Request
            </LoadingButton>
          </Stack>
        </Stack>
      </Box>
    </Box>
  )
}

export default ManualDatacapRequest
