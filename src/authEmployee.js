const EMP_TOKEN = 'employee_token';
export function saveEmpToken(t){ localStorage.setItem(EMP_TOKEN, t); }
export function getEmpToken(){ return localStorage.getItem(EMP_TOKEN); }
export function clearEmpToken(){ localStorage.removeItem(EMP_TOKEN); }
export function isEmpAuthed(){ return !!getEmpToken(); }