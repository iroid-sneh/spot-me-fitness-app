import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboardIcon,
  UsersIcon,
  ImageIcon,
  ShieldCheckIcon,
  CameraIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  SettingsIcon,
  LogOutIcon } from
'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
const navItems = [
{
  path: '/',
  label: 'Dashboard',
  icon: LayoutDashboardIcon
},
{
  path: '/users',
  label: 'User Management',
  icon: UsersIcon
},
{
  path: '/moderation',
  label: 'Moderation Queue',
  icon: ImageIcon
},
{
  path: '/verification',
  label: 'Verification Review',
  icon: ShieldCheckIcon
},
{
  path: '/progress',
  label: 'Progress Capture',
  icon: CameraIcon
},
{
  path: '/reports',
  label: 'Safety & Reports',
  icon: AlertTriangleIcon
},
{
  path: '/financials',
  label: 'Financials',
  icon: DollarSignIcon
},
{
  path: '/settings',
  label: 'Settings',
  icon: SettingsIcon
}];

export function Sidebar() {
  const { admin, logout } = useAdminAuth();

  return (
    <aside className="w-60 bg-sidebar text-white flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight">SPOT ME</h1>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive ? 'bg-white/10 border-l-4 border-primary' : 'text-gray-300 hover:bg-white/5'}`
              }>
              
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>);

        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {(admin?.name || admin?.email || 'SM').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium">{admin?.name || 'Admin User'}</div>
            <div className="text-xs text-gray-400">{admin?.email || 'admin@spotme.com'}</div>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
        >
          <LogOutIcon size={16} />
          Logout
        </button>
      </div>
    </aside>);

}
