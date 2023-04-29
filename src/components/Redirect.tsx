import { useEffect } from 'react';

function Redirect() {
  useEffect(() => {
    const currentDomain = window.location.hostname;
    console.log(currentDomain)
    if (currentDomain.startsWith("plus")) {
      window.location.replace('https://filplus.fil.org');
    }
  }, []);

  return null;
}

export default Redirect;