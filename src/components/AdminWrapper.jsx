import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar.jsx';
import '../css/admin-wrapper.css';

export default function AdminWrapper() {
  return (
    <div className="admin-wrapper">
      <AdminNavbar />
      <main className="admin-wrapper-main">
        <Outlet />
      </main>
    </div>
  );
}
