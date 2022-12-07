import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import {
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import { Data } from "../context/Data/Index";
import { config } from "../config";
import moment from "moment"
import Alert from '@mui/material/Alert';

const testIssueNumber = Number(process.env.REACT_APP_STATUS_ISSUE_NUMBER)
const owner = config.onboardingOwner;
const repo = config.onboardingLargeClientRepo;


const StatusPage = () => {
  const context: any = useContext(Data);
  const { github } = context;

  const [isLDNBotHealthy, setIsLDNBotHealthy] = useState<boolean | null>(null);
  const [isLDNLoading, setIsLDNLoading] = useState<boolean>(false);

  const [isSSAHealhty, setIsSSAHealhty] = useState<boolean | null>(null)
  const [lastSSATime, setLastSSAtime] = useState("")
  const [isSSALoading, setIsSSALoading] = useState(false)

  useEffect(() => {
    checkSSAStatus()
    checkLDNStatus()

  }, [github]);

  const checkLDNStatus = async () => {
    try {
      setIsLDNLoading(true)
      const statusIssue =
        await github?.githubOctoGeneric?.octokit?.rest?.issues.get({
          owner,
          repo,
          issue_number: testIssueNumber,
        });

      if (!statusIssue) return

      //if body == ### Healthcheck... --> loading
      if (statusIssue.data.body === "### LDN HEALTH CHECK") setIsLDNLoading(true)
      //if body != bot is up....  --> ok
      if (statusIssue.data.body.startsWith("### Updated By LDN Bot at ")) {
        setIsLDNLoading(false)
        setIsLDNBotHealthy(true)
      } else {
        setIsLDNBotHealthy(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const checkSSAStatus = async () => {
    setIsSSALoading(true)
    try {
      const comments = await github?.githubOctoGeneric?.octokit?.paginate(
        github?.githubOctoGeneric?.octokit?.issues?.listComments,
        {
          owner,
          repo,
          issue_number: testIssueNumber,
        })

      // getting last SSA and its time. 
      const ssaComments = comments.filter((issue: any) => issue.body.includes("bot ran at"))
      const last_SSA = ssaComments[ssaComments.length - 1].created_at
      setLastSSAtime(last_SSA)
      // check if it is less than 3 hours.
      const is_Ssa_Healhty = moment.duration(moment(new Date()).diff(moment(last_SSA))).asHours() < 3.2
      setIsSSAHealhty(is_Ssa_Healhty)

    } catch (error) {
      console.log(error)
    } finally {
      setIsSSALoading(false)
    }
  }

  const checkHealthStatus = (isLoading: boolean, botStatus: boolean | null) => {
    if (isLoading) {
      return <div>Checking...</div>
    } else {
      if (botStatus) {
        return <CheckCircleIcon sx={{ color: "green" }} />
      } else {
        return <DoNotDisturbOnIcon
          sx={{ color: "red" }}
        />
      }
    }
  }

  return (
    <Box m="0 auto" marginTop="6rem" sx={{ minHeight: "30rem" }}>
      <Typography variant="h4" mb="2rem" textAlign="center">
        Fil+ Services Status
      </Typography>
      <Box sx={{ width: "60rem" }}>
        <Paper elevation={4}>
          <Stack
            sx={{ p: "1rem" }}
            direction="row"
            justifyContent="space-between"
          >
            <Typography variant="h6">
              Current status by service
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={4}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <CheckCircleIcon
                  sx={{ color: "green" }}
                />
                <span>Active</span>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
              >
                <DoNotDisturbOnIcon
                  sx={{ color: "red" }}
                />
                <span>Down</span>
              </Stack>
            </Stack>
          </Stack>
          <Divider />
          <Stack>
            <Stack
              sx={{ p: "1rem" }}
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="body1">
                SSA BOT
              </Typography>
              {checkHealthStatus(isSSALoading, isSSAHealhty)}
            </Stack>
            <Divider />
            <Stack
              sx={{ p: "1rem" }}
              direction="row"
              justifyContent="space-between"
            >
              <Typography variant="body1">
                LDN BOT
              </Typography>
              {checkHealthStatus(isLDNLoading, isLDNBotHealthy)}
            </Stack>
          </Stack>
        </Paper>
      </Box>
      <Stack direction="row" justifyContent="center" alignItems="center" marginTop={10}>{!isSSALoading && <Alert severity="info">
        <Typography variant="body1">The SSA bot run every 3 hours</Typography>
        <Typography variant="body1">The last time SSA bot ran: <span>{moment(lastSSATime).fromNow()}</span></Typography>
      </Alert>}
      </Stack>
    </Box>
  );
};

export default StatusPage;
