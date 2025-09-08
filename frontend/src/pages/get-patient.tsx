import { CONFIG } from 'src/config-global';

import { PatientView } from 'src/sections/patient/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Get Patient - ${CONFIG.appName}`}</title>

      <PatientView />
    </>
  );
}
