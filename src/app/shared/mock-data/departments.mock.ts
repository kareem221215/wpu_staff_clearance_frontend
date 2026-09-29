import { IDepartment } from '../../core/interfaces/department.interface';

// delete later
export const DEPARTMENTS: IDepartment[] = [
  { departmentId: 1, alias: 'pharmacy', name: 'كلية الصيدلة', directManagerId: 101 },
  { departmentId: 2, alias: 'it', name: 'كلية تقنية المعلومات', directManagerId: 102 },
  { departmentId: 3, alias: 'architecture', name: 'كلية الهندسة المعمارية', directManagerId: 103 },
  { departmentId: 4, alias: 'dentistry', name: 'كلية طب الأسنان', directManagerId: 104 },
  {
    departmentId: 5,
    alias: 'civil_engineering',
    name: 'كلية الهندسة المدنية',
    directManagerId: 105,
  },
];
