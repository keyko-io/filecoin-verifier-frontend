import { useEffect } from 'react';
import { config } from '../config';

function Redirect() {
  useEffect(() => {
    const currentDomain = window.location.hostname;
    console.log(currentDomain)
    if (currentDomain.startsWith(config.oldDomain || "")) {
      window.location.replace('https://filplus.fil.org');
    }
  }, []);

  return null;
}

export default Redirect;