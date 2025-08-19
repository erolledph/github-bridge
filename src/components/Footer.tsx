import React from 'react';
import { Shield, FileText, Github, CloudLightning, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Privacy Commitment Section */}
        <div className="alert-success mb-12">
          <div className="flex items-center mb-6">
            <Shield className="h-7 w-7 text-green-600 mr-3" />
            <h3 className="text-xl font-bold text-green-800">Your Privacy is Protected</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start">
              <div className="w-3 h-3 bg-green-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-green-800 text-base">We don't access your account information</p>
                <p className="text-green-700 mt-2">Your GitHub credentials stay secure</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-green-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-green-800 text-base">We don't collect personal data</p>
                <p className="text-green-700 mt-2">No tracking or data harvesting</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-3 h-3 bg-green-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <div>
                <p className="font-semibold text-green-800 text-base">We don't store or steal user data</p>
                <p className="text-green-700 mt-2">Everything stays in your browser</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links and Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/privacy-policy.html" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center font-medium"
                >
                  <FileText size={16} className="mr-3" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-of-service.html" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center font-medium"
                >
                  <FileText size={16} className="mr-3" />
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">About</h4>
            <ul className="space-y-3 text-gray-600">
              <li>Client-side Processing</li>
              <li>No Data Collection</li>
              <li>Secure by Design</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-lg">Resources</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center font-medium"
                >
                  <Github size={16} className="mr-3" />
                  GitHub API
                </a>
              </li>
              <li>
                <a 
                  href="https://bolt.new/?rid=oh23xs" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                 className="text-gray-600 hover:text-green-600 transition-colors flex items-center font-medium"
                >
                  <CloudLightning size={16} className="mr-3" />
                  Bolt.new
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/erolledph/github-bridge-extension" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center font-medium"
                >
                  <Github size={16} className="mr-3" />
                  Browser Extension
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-500">
            <p className="flex items-center mb-6 md:mb-0 font-medium">
              Built with <Heart size={16} className="mx-2 text-red-500" /> for developers
            </p>
            <div className="flex items-center space-x-6 font-medium">
              <span>Powered by GitHub API</span>
              <span>•</span>
              <span>Secured with Firebase</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};