// PaymentTest.tsx
import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';
import CardPaymentModal from '../components/CardPaymentModal';

const PaymentTest: React.FC = () => {
  const [amount, setAmount] = useState<string>('10000');
  const [serviceType, setServiceType] = useState<string>('publication_fee');
  const [description, setDescription] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCardPayment, setShowCardPayment] = useState<boolean>(false);

  const handleCreateTransaction = async () => {
    if (!amount || !serviceType) {
      alert('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.createTransaction(
        parseFloat(amount), 
        serviceType, 
        description
      );
      setResult(response);
      setTransactionId(response.id || '');
    } catch (error) {
      console.error('Error creating transaction:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePreparePayment = async () => {
    if (!transactionId) {
      alert('Please create transaction first');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.preparePayment(transactionId);
      setResult(response);
    } catch (error) {
      console.error('Error preparing payment:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!transactionId) {
      alert('Please create transaction first');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.checkPaymentStatus(transactionId);
      setResult(response);
    } catch (error) {
      console.error('Error checking payment status:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToPayment = async () => {
    if (!transactionId) {
      alert('Please create transaction first');
      return;
    }

    setLoading(true);
    try {
      // To'lov sahifasiga o'tish uchun URL olish
      const response = await paymentService.getPaymentUrl(transactionId, `${window.location.origin}/payment-success`);
      const paymentUrl = response.payment_url;
      
      // Foydalanuvchini to'lov sahifasiga yo'naltirish
      window.open(paymentUrl, '_blank');
      setResult(response);
    } catch (error) {
      console.error('Error getting payment URL:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Click Payment Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Transaction</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (UZS)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter amount"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="publication_fee">Publication Fee</option>
              <option value="fast-track">Fast Track</option>
              <option value="translation">Translation</option>
              <option value="book_publication">Book Publication</option>
              <option value="language_editing">Language Editing</option>
              <option value="top_up">Top Up</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
            />
          </div>
          
          <button
            onClick={handleCreateTransaction}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create Transaction'}
          </button>
        </div>
      </div>
      
      {transactionId && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Actions</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction ID: {transactionId}
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button
                onClick={handlePreparePayment}
                disabled={loading}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Prepare Payment'}
              </button>

              <button
                onClick={handleCheckStatus}
                disabled={loading}
                className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Check Status'}
              </button>

              <button
                onClick={handleGoToPayment}
                disabled={loading}
                className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Go to Payment'}
              </button>

              <button
                onClick={() => setShowCardPayment(true)}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Pay with Card'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <CardPaymentModal
        isOpen={showCardPayment}
        onClose={() => setShowCardPayment(false)}
        transactionId={transactionId}
        amount={parseFloat(amount)}
        serviceType={serviceType}
        onPaymentSuccess={() => {
          setResult({ success: 'Payment completed successfully!' });
          setShowCardPayment(false);
        }}
        onPaymentError={(error) => {
          setResult({ error });
          setShowCardPayment(false);
        }}
      />
    </div>
  );
};

export default PaymentTest;