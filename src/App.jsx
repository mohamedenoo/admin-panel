// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Sites from './pages/Sites';
import Users from './pages/Users';
import Attendance from './pages/Attendance';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { isAuthed } from './auth';


import EmployeeLogin from './pages/EmployeeLogin';
import EmployeeCheck from './pages/EmployeeCheck';
import { isEmpAuthed } from './authEmployee';

function PrivateEmp({ children }) { return isEmpAuthed() ? children : <Navigate to="/emp/login" />; }


function Private({ children }) {
  return isAuthed() ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container main">
        {children}
      </main>
    </>
  );
}

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />

        <Route path="/dashboard" element={
          <Private><Layout><Dashboard/></Layout></Private>
        }/>

        <Route path="/sites" element={
          <Private><Layout><Sites/></Layout></Private>
        }/>

        <Route path="/users" element={
          <Private><Layout><Users/></Layout></Private>
        }/>

        <Route path="/attendance" element={
          <Private><Layout><Attendance/></Layout></Private>
        }/>

        <Route path="*" element={<Navigate to="/dashboard" />} />
        
        
<Route path="/emp/login" element={<EmployeeLogin/>} />
<Route path="/emp" element={
  <PrivateEmp>
    <main className="container main"><EmployeeCheck/></main>
  </PrivateEmp>
}/>


      </Routes>
    </BrowserRouter>
  );
}