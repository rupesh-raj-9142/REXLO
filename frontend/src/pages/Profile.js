import React from 'react';
import { User, Mail, Phone, Calendar, Trophy, Gamepad2, Edit } from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">John Doe</h2>
              <p className="text-gray-400 mb-4">@johndoe</p>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">john@example.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">+1 234 567 8900</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Joined Jan 2024</span>
                </div>
              </div>

              <button className="btn-primary w-full mt-6 flex items-center justify-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Stats and Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game Stats */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-6">Game Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Gamepad2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">25</p>
                  <p className="text-gray-400 text-sm">Games Played</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Trophy className="h-6 w-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">15</p>
                  <p className="text-gray-400 text-sm">Games Won</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">60%</p>
                  <p className="text-gray-400 text-sm">Win Rate</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Trophy className="h-6 w-6 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">$500</p>
                  <p className="text-gray-400 text-sm">Total Won</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-6">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-gray-400 text-sm">Receive game updates and offers</p>
                  </div>
                  <button className="w-12 h-6 bg-accent-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-gray-400 text-sm">Get notified about game invites</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
