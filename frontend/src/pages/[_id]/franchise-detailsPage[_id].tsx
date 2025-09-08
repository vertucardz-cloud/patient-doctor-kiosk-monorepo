import { CONFIG } from 'src/config-global';

import { FranchiseViewID } from 'src/sections/franchise/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Create Franchise - ${CONFIG.appName}`}</title>

      <FranchiseViewID />
    </>
  );
}
