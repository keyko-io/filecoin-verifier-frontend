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

// The main goal of this function is just to wait for 5 seconds before
// executing the next line of code after it
const wait5Seconds = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok');
    }, 5000);
  });
};

const testIssueNumber = Number(process.env.REACT_APP_STATUS_ISSUE_NUMBER)
const owner = config.onboardingOwner;
const repo = config.onboardingLargeClientRepo;

const LDNBotHealthCheck = async (gh: any): Promise<boolean> => {
  let result;
  try {
    if (!gh || Object.keys(gh).length < 1) {
      console.log("NO GH INSTANCE AVAILABLE!!");
      return false;
    }
    const initialBody = "### LDN HEALTH CHECK";
    // Update issue body
    await gh?.githubOcto?.rest?.issues?.update({
      owner,
      repo,
      issue_number: testIssueNumber,
      body: initialBody,
    });
    // Wait for 5 seconds to give the bot time to update the
    // issue
    await wait5Seconds();
    // Get Issue after bot have updated it
    const issueAfterChange =
      await gh?.githubOcto?.rest?.issues.get({
        owner,
        repo,
        issue_number: testIssueNumber,
      });


    if (issueAfterChange?.data?.body !== initialBody) {
      result = true;
    } else {
      result = false;
      await gh?.githubOcto?.rest?.issues?.update({
        owner,
        repo,
        issue_number: testIssueNumber,
        body: "LDN ready for testing",
      });
    }

    return result;

  } catch (err) {
    console.log(err);
    return false;
  }
};

const StatusPage = () => {
  const context: any = useContext(Data);
  const { github } = context;

  const [isLDNBotHealthy, setIsLDNBotHealthy] = useState<boolean | null>(null);
  const [isLDNLoading, setIsLDNLoading] = useState<boolean>(false);

  const [isSSAHealhty, setIsSSAHealhty] = useState<boolean | null>(null)
  const [lastSSATime, setLastSSAtime] = useState("")
  const [isSSALoading, setIsSSALoading] = useState(false)

  useEffect(() => {
    getComments()

    const handler = async () => {
      setIsLDNLoading(true);
      let res = await LDNBotHealthCheck(github);
      setIsLDNLoading(false);
      setIsLDNBotHealthy(Boolean(res));
    };

    handler();
  },[github]);

  const getComments = async () => {
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
      const last_SSA = comments.reverse().find((issue: any) => issue.body.includes("SSA bot ran")).created_at
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
        Service Status
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
        <Typography variant="body1">The last time SSA bot ran: <span>{moment(lastSSATime).fromNow()}</span></Typography>
      </Alert>}
      </Stack>
    </Box>
  );
};

export default StatusPage;
