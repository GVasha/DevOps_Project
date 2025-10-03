import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HomeIcon,
  CameraIcon,
  DocumentTextIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'New Assessment', href: '/assessment', icon: CameraIcon },
  { name: 'Claims', href: '/claims', icon: DocumentTextIcon },
  { name: 'Profile', href: '/profile', icon: UserIcon },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:pt-16">
      <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                    `}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Bottom section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
            <div className="text-xs text-gray-500">
              <p>Insurance Portal v1.0</p>
              <p>© 2024 DevOps Insurance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
