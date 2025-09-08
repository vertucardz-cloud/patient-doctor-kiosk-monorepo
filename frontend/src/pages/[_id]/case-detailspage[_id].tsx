import { CONFIG } from 'src/config-global';

import { CaseViewID } from 'src/sections/case/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Case Details - ${CONFIG.appName}`}</title>

      <CaseViewID />
    </>
  );
}
