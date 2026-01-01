import React, { useState } from 'react';
import { paymentService } from '../services/paymentService';

interface CardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  amount: number;
  serviceType: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  amount,
  serviceType,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [step, setStep] = useState<'card' | 'sms' | 'processing'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [cardToken, setCardToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpireDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expireDate) {
      setError('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      const cleanExpireDate = expireDate.replace('/', '');

      const response = await paymentService.requestCardToken(
        cleanCardNumber,
        cleanExpireDate,
        serviceType
      );

      if (response.error_code === 0 && response.card_token) {
        setCardToken(response.card_token);
        setStep('sms');
      } else {
        setError(response.error_note || 'Kartani tekshirishda xatolik yuz berdi');
      }
    } catch (err: any) {
      setError(err.message || 'Kartani tekshirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsCode) {
      setError('Iltimos, SMS kodni kiriting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await paymentService.verifyCardToken(
        cardToken,
        smsCode,
        serviceType
      );

      if (response.error_code === 0) {
        // Token verified, now process payment
        await handlePayment();
      } else {
        setError(response.error_note || 'SMS kod noto\'g\'ri');
      }
    } catch (err: any) {
      setError(err.message || 'SMS kodni tekshirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setStep('processing');
    setLoading(true);
    setError('');

    try {
      const response = await paymentService.payWithCardToken(
        cardToken,
        amount,
        transactionId,
        serviceType
      );

      if (response.error_code === 0) {
        onPaymentSuccess();
        onClose();
      } else {
        setError(response.error_note || 'To\'lovda xatolik yuz berdi');
        setStep('sms');
      }
    } catch (err: any) {
      setError(err.message || 'To\'lovda xatolik yuz berdi');
      setStep('sms');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('card');
    setCardNumber('');
    setExpireDate('');
    setSmsCode('');
    setCardToken('');
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {step === 'card' && 'Karta ma\'lumotlarini kiriting'}
            {step === 'sms' && 'SMS kodni kiriting'}
            {step === 'processing' && 'To\'lov amalga oshirilmoqda...'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {step === 'card' && (
          <form onSubmit={handleCardSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Karta raqami
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amal qilish muddati (MM/YY)
              </label>
              <input
                type="text"
                value={expireDate}
                onChange={(e) => setExpireDate(formatExpireDate(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="12/25"
                maxLength={5}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600">
                To'lov summasi: <strong>{amount.toLocaleString()} UZS</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Yuborilmoqda...' : 'SMS kod yuborish'}
            </button>
          </form>
        )}

        {step === 'sms' && (
          <form onSubmit={handleSmsSubmit}>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Kartangizga SMS kod yuborildi. Iltimos, kodni kiriting:
              </p>
              <input
                type="text"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                placeholder="123456"
                maxLength={6}
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600">
                To'lov summasi: <strong>{amount.toLocaleString()} UZS</strong>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('card')}
                disabled={loading}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Orqaga
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Tekshirilmoqda...' : 'To\'lash'}
              </button>
            </div>
          </form>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>To'lov amalga oshirilmoqda...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardPaymentModal;