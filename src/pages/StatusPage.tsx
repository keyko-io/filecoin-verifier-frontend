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

// The main goal of this function is just to wait for 5 seconds before
// executing the next line of code after it
const wait5Seconds = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok');
    }, 5000);
  });
};

const testIssueNumber = process.env.REACT_APP_TEST_ISSUE_NUMBER || 1407
const owner = config.onboardingOwner;
const repo = config.onboardingLargeClientRepo;


const LDNBotHealthCheck = async (gh: any): Promise<boolean> => {
  try {
    if (!gh || Object.keys(gh).length < 1) {
      console.log("NO GH INSTANCE AVAILABLE!!");
      return false;
    }
    let result = false;
    const initialBody = "Test Body";
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
    if (!issueAfterChange) {
      return false;
    }
    if (issueAfterChange?.body !== initialBody) {
      result = true;
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
  const [isLDNBotHealthy, setIsLDNBotHealthy] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSSAHealhty, setIsSSAHealhty] = useState<boolean | null>(null)

  const [lastSSATime, setLastSSAtime] = useState("")

  useEffect(() => {
    getComments()

    const handler = async () => {
      setIsLoading(true);
      let res = await LDNBotHealthCheck(github);
      setIsLDNBotHealthy(Boolean(res));
      setIsLoading(false);
    };

    handler();
  }, [github]);

  const getComments = async () => {
    try {
      const comments = await github?.githubOcto?.paginate(
        github?.githubOcto?.issues?.listComments,
        {
          owner,
          repo,
          issue_number: testIssueNumber,
        })

      const last_SSA = comments[comments.length - 1].created_at
      setLastSSAtime(last_SSA)
      const is_Ssa_Healhty = moment.duration(moment(new Date()).diff(moment(last_SSA))).asHours() < 3.2
      setIsSSAHealhty(is_Ssa_Healhty)

    } catch (error) {
      console.log(error)
    }
  }


  return (
    <Box m="8rem auto">
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

              <div>
                SSA Bot ran {moment(lastSSATime).fromNow()}
              </div>
              {isSSAHealhty ? <CheckCircleIcon
                sx={{ color: "green" }}
              /> : <DoNotDisturbOnIcon
                sx={{ color: "red" }}
              />
              }


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
              {isLDNBotHealthy ? (
                <CheckCircleIcon
                  sx={{ color: "green" }}
                />
              ) : isLoading ? (
                "Checking.."
              ) : (
                <DoNotDisturbOnIcon
                  sx={{ color: "red" }}
                />
              )}
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default StatusPage;
