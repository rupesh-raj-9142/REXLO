import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Camera, 
  QrCode, 
  CreditCard, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Clock,
  Smartphone,
  RefreshCw
} from 'lucide-react';

const PaymentScanner = () => {
  const { user, token } = useAuthStore();
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [paymentId, setPaymentId] = useState('');
  const [amount, setAmount] = useState(50);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('scan');
  
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch('/api/payment-scanner/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setPaymentHistory(data.payments);
      }
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    }
  };

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facing: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanning(true);
    } catch (error) {
      console.error('Camera access error:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  // Generate QR code for payment
  const generatePaymentQR = async () => {
    if (!amount || amount < 10 || amount > 1000) {
      alert('Amount must be between $10 and $1000');
      return;
    }

    try {
      const response = await fetch('/api/payment-scanner/generate-qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          gameType: 'carrom'
        })
      });

      const data = await response.json();
      if (data.success) {
        setPaymentId(data.paymentId);
        setQrData(data.qrCode);
        setActiveTab('qr');
      } else {
        alert(data.error || 'Failed to generate QR code');
      }
    } catch (error) {
      console.error('Generate QR error:', error);
      alert('Failed to generate QR code');
    }
  };

  // Process payment
  const processPayment = async () => {
    if (!paymentId) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/payment-scanner/process-payment/${paymentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          transactionId: `txn_${Date.now()}`
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Payment of $${amount} processed successfully!`);
        setPaymentId('');
        setQrData(null);
        setActiveTab('scan');
        fetchPaymentHistory(); // Refresh history
      } else {
        alert(data.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Process payment error:', error);
      alert('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    try {
      const response = await fetch(`/api/payment-scanner/status/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        if (data.status === 'completed') {
          alert('Payment completed successfully!');
          setPaymentId('');
          setQrData(null);
          setActiveTab('scan');
          fetchPaymentHistory();
        } else if (data.isExpired) {
          alert('Payment session expired. Please generate a new QR code.');
        }
      }
    } catch (error) {
      console.error('Check status error:', error);
    }
  };

  // Handle file upload for QR code
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const qrData = e.target.result;
          // In a real app, use a QR code scanning library
          // For now, just display the uploaded data
          setQrData(qrData);
          alert('QR code uploaded. Processing...');
        } catch (error) {
          console.error('QR scan error:', error);
          alert('Failed to process QR code');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 gaming-title">
            Payment Scanner
          </h1>
          <p className="text-gray-400 text-lg">
            Scan QR codes or generate payment codes for instant game entry
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 border-b border-gray-700">
          {['scan', 'generate', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Scan Tab */}
        {activeTab === 'scan' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Camera Scanner */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Camera className="h-6 w-6 mr-2 text-blue-400" />
                Scan QR Code
              </h2>
              
              <div className="space-y-4">
                {scanning ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 bg-black rounded-lg"
                    />
                    <button
                      onClick={stopCamera}
                      className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Stop Scanning
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={startCamera}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Start Camera Scanner
                    </button>
                    
                    <div className="mt-4 text-center">
                      <span className="text-gray-400">OR</span>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Upload QR Code Image
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <QrCode className="h-6 w-6 mr-2 text-green-400" />
                Scanned Code
              </h2>
              
              {qrData ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-800 font-mono text-sm break-all">
                      {qrData}
                    </p>
                  </div>
                  
                  <button
                    onClick={checkPaymentStatus}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Process Payment
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No QR code scanned</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-400" />
              Generate Payment QR Code
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Entry Fee Amount ($)
                </label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Game Entry: ${amount} | Prize: ${amount * 2}
                </p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="upi">UPI</option>
                  <option value="card">Credit Card</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>

              <button
                onClick={generatePaymentQR}
                disabled={processing}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-5 w-5 mr-2" />
                    Generate QR Code
                  </>
                )}
              </button>

              {paymentId && qrData && (
                <div className="mt-6 space-y-4">
                  <div className="bg-white p-4 rounded-lg">
                    <p className="text-gray-800 font-mono text-sm break-all mb-2">
                      {qrData}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Payment ID: {paymentId}
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={checkPaymentStatus}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Check Status
                    </button>
                    
                    <button
                      onClick={() => {
                        setPaymentId('');
                        setQrData(null);
                      }}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center mt-4">
                    <Clock className="h-4 w-4 text-yellow-400 mr-2" />
                    <span className="text-yellow-400 text-sm">
                      QR code expires in 5 minutes
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Clock className="h-6 w-6 mr-2 text-purple-400" />
              Payment History
            </h2>
            
            {paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-white font-semibold">
                          ${payment.amount}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {payment.gameType} Entry Fee
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payment.status === 'completed' 
                            ? 'bg-green-600 text-white' 
                            : payment.status === 'pending'
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                      <div>
                        <span className="block">Payment ID:</span>
                        <span className="text-white">{payment.paymentId}</span>
                      </div>
                      <div>
                        <span className="block">Transaction ID:</span>
                        <span className="text-white">{payment.transactionId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block">Created:</span>
                        <span className="text-white">
                          {new Date(payment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="block">Completed:</span>
                        <span className="text-white">
                          {payment.completedAt 
                            ? new Date(payment.completedAt).toLocaleString()
                            : 'Pending'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Smartphone className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No payment history found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentScanner;
