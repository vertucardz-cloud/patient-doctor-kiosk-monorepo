import { SvgColor } from 'src/components/svg-color';
// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'User',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: 'Franchise',
    path: '/franchise',
    icon: icon('ic-create'),
  },
  {
    title: 'Doctor',
    path: '/doctor',
    icon: icon('ic-doctor'),
  },
  {
    title: 'Patient',
    path: '/patient',
    icon: icon('ic-patient'),
  },
  {
    title: 'Case',
    path: '/case',
    icon: icon('ic-case'),
  },
  {
    title: 'LogOut',
    path: '/sign-in',
    icon: icon('ic-logout'),
  }
];
