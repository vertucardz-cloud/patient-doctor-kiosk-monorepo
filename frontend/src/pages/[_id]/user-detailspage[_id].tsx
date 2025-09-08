import { CONFIG } from 'src/config-global';

import { UserViewID } from 'src/sections/user/view';
// ----------------------------------------------------------------------
export default function Page() {
  return (
    <>
      <title>{`User Details - ${CONFIG.appName}`}</title>
      <UserViewID />
    </>
  );
}
