import React from 'react';
import './DeprecationWarning.scss';

const DeprecationWarning: React.FC = () => {
  return (
    <div className="deprecation-warning" role="alert">
      <p>Important Notice</p>
      <p>
        Beginning July 2024, the https://filplus.fil.org/#/ site will no longer serve as the resource to find Filecoin+ allocators. 
        You can now find an allocator from the <a href="https://github.com/filecoin-project/Allocator-registry" target="_blank" rel="noreferrer">full 
        list of active allocators</a> or the <a href="https://github.com/filecoin-project/Allocator-registryhttps://allocator.tech/" target="_blank" rel="noreferrer">active list of allocators</a> 
        who have verified public datasets. 
        To apply for DataCap, please reach out directly to any DataCap allocator, such as the <a href="https://www.fidl.tech/apply-for-datacap" target='_blank' rel="noreferrer">Filecoin Incentive Design Lab</a>.
      </p>
    </div>
  );
};

export default DeprecationWarning;