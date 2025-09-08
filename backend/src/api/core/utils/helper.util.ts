import { v4 as uuidv4 } from 'uuid';

const generateQRCodeData = (franchiseId: string): string => {
  return `FRAN-${franchiseId}-${Date.now()}`;
};

const validatePhoneNumber = (phone: string): boolean => {
  // Simple validation - adjust as needed
  return /^\+?[1-9]\d{1,14}$/.test(phone);
};

const formatCaseForDisplay = (caseData: any) => {
  return {
    id: caseData.id,
    status: caseData.status,
    patient: caseData.patientName || 'Anonymous',
    franchise: caseData.franchise?.name || 'Unknown',
    createdAt: caseData.createdAt,
    updatedAt: caseData.updatedAt,
  };
};

export { generateQRCodeData, formatCaseForDisplay, validatePhoneNumber };
