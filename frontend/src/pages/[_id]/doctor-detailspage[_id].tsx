import { CONFIG } from 'src/config-global';

import { DoctorViewID } from 'src/sections/doctor/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Create Franchise - ${CONFIG.appName}`}</title>

      <DoctorViewID />
    </>
  );
}
