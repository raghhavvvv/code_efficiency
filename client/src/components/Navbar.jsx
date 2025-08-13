// client/src/components/Navbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, NavLink } from 'react-router-dom';
// The import is correct here, we have faTachometerAlt
import { faCode, faSignOutAlt, faTachometerAlt, faChartLine, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const Navbar = () => {
  const { user, logout } = useAuth();

  const activeLinkStyle = {
    color: '#22d3ee', // Tailwind's cyan-400
    borderBottom: '2px solid #22d3ee'
  };

  return (
    <nav className="bg-gray-800/80 backdrop-blur-sm text-white p-4 shadow-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-3 hover:text-cyan-400 transition-colors">
          <FontAwesomeIcon icon={faCode} className="text-cyan-400" />
          Coding Efficiency Tracker
        </Link>
        
        {user && (
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6 text-gray-300">
               {/* THE FIX IS HERE: The icon was likely mistyped as faTasks, it should be faTachometerAlt */}
               <NavLink to="/" end className="flex items-center gap-2 hover:text-white transition-colors pb-1" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <FontAwesomeIcon icon={faTachometerAlt} /> Dashboard
               </NavLink>
               <NavLink to="/stats" className="flex items-center gap-2 hover:text-white transition-colors pb-1" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                    <FontAwesomeIcon icon={faChartLine} /> My Stats
               </NavLink>
               {user.role === 'admin' && (
                   <NavLink to="/admin" className="flex items-center gap-2 hover:text-white transition-colors pb-1" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>
                        <FontAwesomeIcon icon={faUserShield} /> Admin
                   </NavLink>
               )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-400">Welcome, <span className="font-semibold text-white">{user.username}</span></span>
              <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105">
                <FontAwesomeIcon icon={faSignOutAlt} /><span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;