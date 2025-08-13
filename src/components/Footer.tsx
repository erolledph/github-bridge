import React from 'react';
import { Shield, FileText, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Privacy Commitment Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-green-800">Your Privacy is Protected</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-green-800">We don't access your account information</p>
                <p className="text-green-700 mt-1">Your GitHub credentials stay secure</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-green-800">We don't collect personal data</p>
                <p className="text-green-700 mt-1">No tracking or data harvesting</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-green-800">We don't store or steal user data</p>
                <p className="text-green-700 mt-1">Everything stays in your browser</p>
              </div>
            </div>
          </div>
        </div>

        {/* Links and Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="/privacy-policy.html" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center"
                >
                  <FileText size={14} className="mr-2" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms-of-service.html" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center"
                >
                  <FileText size={14} className="mr-2" />
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">About</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Free & Open Source</li>
              <li>Client-side Processing</li>
              <li>No Data Collection</li>
              <li>Secure by Design</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center"
                >
                  <Github size={14} className="mr-2" />
                  GitHub API
                </a>
              </li>
              <li>
                <a 
                  href="https://bolt.new" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Bolt.new Platform
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p className="flex items-center mb-4 md:mb-0">
              Built with <Heart size={14} className="mx-1 text-red-500" /> for developers
            </p>
            <div className="flex items-center space-x-4">
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