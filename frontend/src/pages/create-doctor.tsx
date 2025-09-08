import { CONFIG } from 'src/config-global';

import { DoctorView } from 'src/sections/doctor/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Create Doctor - ${CONFIG.appName}`}</title>

      <DoctorView />
    </>
  );
}
