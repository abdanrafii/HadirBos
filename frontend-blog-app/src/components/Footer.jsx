import React from 'react'

const Footer = () => {
  return (
    <footer className="w-full bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-[#b19777] mb-2">HR Management System</h3>
            <p className="text-gray-300">Transforming HR operations since 2015</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-12">
            <div>
              <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Services</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-300">info@hrmanagement.com</li>
                <li className="text-gray-300">+1 (555) 123-4567</li>
                <li className="text-gray-300">123 Business Ave, Suite 100</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-gray-400">
          &copy; {new Date().getFullYear()} HR Management System. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default Footer