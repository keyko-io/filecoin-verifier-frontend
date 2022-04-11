import React from "react";
import App from "../App";
import ClientDetails from "../pages/ClientDetails";
import Landing from "../pages/Landing";
import LdnApplication from "../pages/LdnApplication";
import LogExplorer from "../pages/LogExplorer";
import Miners from "../pages/Miners";
import Miners2 from "../pages/Miners2";
import Onboarding from "../pages/Onboarding";
import Preonboarding from "../pages/Preonboarding";
import Verifiers from "../pages/Verifiers";
import Verifiers2 from "../pages/Verifiers2";

export const routes  = [
    {
      path: '/',
      component: <Onboarding />,
    },
    {
      path: '/app',
      component: <App />,
    },
    {
      path: '/wallet',
      component: <Preonboarding />,
    },
    {
      path: '/landing',
      component: <Landing />,
    },
    {
      path: '/verifiers',
      component: <Verifiers />,
    },
    {
      path: '/verifiers2',
      component: <Verifiers2 />,
    },
    {
      path: '/ldn-application',
      component: <LdnApplication />,
    },
    {
      path: '/miners',
      component: <Miners />,
    },
    {
      path: '/miners2',
      component: <Miners2 />,
    },
    {
      path: '/client',
      component: <ClientDetails />,
    },
    {
      path: '/logs',
      component: <LogExplorer />,
    },
  ]