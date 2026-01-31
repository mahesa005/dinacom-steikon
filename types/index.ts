export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  ageMonths: number;
  gender: 'male' | 'female';
  birthWeight: number;
  birthLength: number;
  parentName: string;
  parentPhone: string;
  parentEducation: string;
  parentHeight: number;
  fatherName: string;
  fatherEducation: string;
  fatherHeight: number;
  riskLevel: RiskLevel;
  riskPercentage: number;
  mainFactor: string;
  mainFactorIcon: string;
  lastCheckup: string;
  nextCheckup: string;
  toiletFacility: 'good' | 'adequate' | 'poor';
  wasteManagement: 'good' | 'adequate' | 'poor';
  waterAccess: 'good' | 'adequate' | 'poor';
}

export interface ExaminationHistory {
  id: string;
  patientId: string;
  date: string;
  month: number;
  weight: number;
  height: number;
  riskLevel: RiskLevel;
  riskPercentage: number;
  notes?: string;
}

export interface RiskFactor {
  name: string;
  icon: string;
  percentage: number;
  color: 'red' | 'orange' | 'yellow';
}

export interface Intervention {
  id: number;
  title: string;
  description: string;
  color: 'green' | 'blue' | 'orange';
}

export interface User {
  id: string;
  name: string;
  role: string;
  institution: string;
  initials: string;
}

export interface DashboardStats {
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  todayCheckups: number;
  todayPresent: number;
  todayPending: number;
  totalPatients: number;
}
