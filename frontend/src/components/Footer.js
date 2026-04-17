import React from 'react';
import { Gamepad2, Mail, Twitter, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-dark border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Gamepad2 className="h-6 w-6 text-accent-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                Rexlo
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The ultimate multiplayer gaming platform where you can play Ludo, Carrom, and more games with friends while winning real money.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/games" className="text-gray-400 hover:text-accent-400 text-sm transition-colors">Games</a></li>
              <li><a href="/leaderboard" className="text-gray-400 hover:text-accent-400 text-sm transition-colors">Leaderboard</a></li>
              <li><a href="/wallet" className="text-gray-400 hover:text-accent-400 text-sm transition-colors">Wallet</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-accent-400 text-sm transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-accent-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-accent-400 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-accent-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Rexlo Gaming Platform. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for gamers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
