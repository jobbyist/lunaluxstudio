import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} LunaStudio. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="/privacy" className="hover:text-gray-300">Privacy Policy</a>
          <a href="/terms" className="hover:text-gray-300">Terms of Service</a>
          <a href="/admin" className="hover:text-gray-300">Admin Dashboard</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;