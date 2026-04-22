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
  SettingsIcon } from
'lucide-react';
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
            SM
          </div>
          <div>
            <div className="text-sm font-medium">Admin User</div>
            <div className="text-xs text-gray-400">admin@spotme.com</div>
          </div>
        </div>
      </div>
    </aside>);

}