// src/components/formFieldsData.ts

export type FormField = {
  id: string;
  label: string;
};

export const formFields: FormField[] = [
  { id: 'username', label: 'Username' },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'specialty', label: 'Specialty' },
  { id: 'password', label: 'Password' },
];
