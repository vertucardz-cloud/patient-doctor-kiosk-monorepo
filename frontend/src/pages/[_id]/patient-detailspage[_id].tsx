import { CONFIG } from 'src/config-global';

import { PatientViewID } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Patient Details - ${CONFIG.appName}`}</title>

      <PatientViewID />
    </>
  );
}
