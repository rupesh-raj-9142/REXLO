import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Send, Check, Shield, Ban, Settings, Eye, AlertTriangle } from 'lucide-react';

const GameRoom = () => {
  const { gameId } = useParams();
  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Mock admin status
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    entryFee: 25,
    maxPlayers: 4,
    gameType: 'ludo',
    autoStart: true,
    allowSpectators: true
  });
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player1', isReady: true },
    { id: 2, name: 'Player2', isReady: false },
    { id: 3, name: 'rupesh123', isReady: false, isCurrentPlayer: true }
  ]);
  const [allPlayersReady, setAllPlayersReady] = useState(false);

  useEffect(() => {
    const allReady = players.every(player => player.isReady);
    setAllPlayersReady(allReady);
  }, [players]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game Room</h1>
            <p className="text-gray-400">Game ID: {gameId}</p>
          </div>
          
          {/* Admin Panel Toggle */}
          {isAdmin && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`btn-secondary flex items-center space-x-2 ${
                  showAdminPanel ? 'bg-accent-500' : ''
                }`}
              >
                <Shield className="h-5 w-5" />
                <span>Admin Panel</span>
              </button>
              <button className="btn-secondary p-2">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {isAdmin && showAdminPanel && (
          <div className="card mb-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-400" />
                <span>Game Admin Controls</span>
              </h2>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Game Settings */}
              <div className="space-y-3">
                <h3 className="text-white font-medium mb-2">Game Settings</h3>
                <div>
                  <label className="text-gray-400 text-sm">Entry Fee</label>
                  <input
                    type="number"
                    value={gameSettings.entryFee}
                    onChange={(e) => setGameSettings({...gameSettings, entryFee: parseInt(e.target.value)})}
                    className="input text-sm mt-1"
                    min="5"
                    max="1000"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Max Players</label>
                  <select
                    value={gameSettings.maxPlayers}
                    onChange={(e) => setGameSettings({...gameSettings, maxPlayers: parseInt(e.target.value)})}
                    className="input text-sm mt-1"
                  >
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Game Type</label>
                  <select
                    value={gameSettings.gameType}
                    onChange={(e) => setGameSettings({...gameSettings, gameType: e.target.value})}
                    className="input text-sm mt-1"
                  >
                    <option value="ludo">Ludo</option>
                    <option value="carrom">Carrom</option>
                  </select>
                </div>
              </div>

              {/* Player Management */}
              <div className="space-y-3">
                <h3 className="text-white font-medium mb-2">Player Management</h3>
                <button className="btn-secondary w-full text-sm flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>View All Players</span>
                </button>
                <button className="btn-secondary w-full text-sm flex items-center justify-center space-x-2">
                  <Ban className="h-4 w-4" />
                  <span>Kick Player</span>
                </button>
                <button className="btn-secondary w-full text-sm flex items-center justify-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Spectate Mode</span>
                </button>
              </div>

              {/* Game Control */}
              <div className="space-y-3">
                <h3 className="text-white font-medium mb-2">Game Control</h3>
                <button className="btn-primary w-full text-sm flex items-center justify-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Start Game Now</span>
                </button>
                <button className="btn-secondary w-full text-sm flex items-center justify-center space-x-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Pause Game</span>
                </button>
                <button className="btn-secondary w-full text-sm flex items-center justify-center space-x-2 text-red-400">
                  <Ban className="h-4 w-4" />
                  <span>End Game</span>
                </button>
              </div>

              {/* Monitoring */}
              <div className="space-y-3">
                <h3 className="text-white font-medium mb-2">Monitoring</h3>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-sm">Game Status:</span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-sm">Duration:</span>
                    <span className="text-white text-sm">5:23</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400 text-sm">Server Ping:</span>
                    <span className="text-green-400 text-sm">45ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Connections:</span>
                    <span className="text-white text-sm">3/4</span>
                  </div>
                </div>
                <button className="btn-secondary w-full text-sm flex items-center justify-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>View Logs</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameSettings.autoStart}
                    onChange={(e) => setGameSettings({...gameSettings, autoStart: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-400 text-sm">Auto-start when ready</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={gameSettings.allowSpectators}
                    onChange={(e) => setGameSettings({...gameSettings, allowSpectators: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-gray-400 text-sm">Allow spectators</span>
                </label>
              </div>
              <button className="btn-primary text-sm">
                Save Settings
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="card p-8">
              <div className={`aspect-square rounded-xl flex items-center justify-center ${
                allPlayersReady 
                  ? 'bg-gradient-to-br from-green-800 to-green-900 border-2 border-green-500' 
                  : 'bg-gradient-to-br from-gray-800 to-gray-900'
              }`}>
                <div className="text-center">
                  <Gamepad2 className={`h-16 w-16 mx-auto mb-4 ${
                    allPlayersReady ? 'text-green-400' : 'text-accent-400'
                  }`} />
                  <h2 className="text-xl font-semibold text-white mb-2">Game Board</h2>
                  {allPlayersReady ? (
                    <div>
                      <p className="text-green-400 font-semibold mb-2">All Players Ready!</p>
                      <p className="text-white">Game starting soon...</p>
                      <div className="mt-4">
                        <div className="spinner mx-auto"></div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Game will start when all players are ready</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Players</h3>
              <div className="space-y-3">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${
                      player.isCurrentPlayer 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : 'bg-gradient-to-r from-accent-400 to-accent-600'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        {player.name}
                        {player.isCurrentPlayer && <span className="ml-2 text-green-400 text-xs">(You)</span>}
                      </p>
                      <p className={`text-xs ${player.isReady ? 'text-green-400' : 'text-yellow-400'}`}>
                        {player.isReady ? 'Ready' : 'Not Ready'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Ready Button for Current Player */}
              {!isReady && (
                <button
                  onClick={() => {
                    setIsReady(true);
                    setPlayers(prev => prev.map(p => 
                      p.isCurrentPlayer ? { ...p, isReady: true } : p
                    ));
                  }}
                  className="btn-primary w-full mt-4 flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Ready Up!</span>
                </button>
              )}
              
              {isReady && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
                  <p className="text-green-400 font-medium">You are ready!</p>
                  <p className="text-gray-400 text-sm">Waiting for other players...</p>
                </div>
              )}
            </div>

            {/* Chat */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>
              <div className="space-y-3 mb-4">
                <div className="text-sm">
                  <span className="text-accent-400">Player1:</span>
                  <span className="text-gray-400 ml-2">Good luck!</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  className="input text-sm flex-1"
                />
                <button className="btn-primary p-2">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
