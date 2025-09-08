// src/components/formFieldsData.ts

export type FormField = {
  id: string;
  label: string;
};

export const formFields: FormField[] = [
  { id: 'name', label: 'Franchise' },
  { id: 'address', label: 'Address' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'postalCode', label: 'postalCode' },
  { id: 'city', label: 'City' },
  { id: 'state', label: 'State' },
  { id: 'country', label: 'Country' },
];
