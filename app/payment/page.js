'use client'

// Import necessary modules and components
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';


const PaymentModal = ({ onClose, tableName, totalAmount, tableId }) => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    totalAmount: 0,
    cashAmount: 0,
    onlinePaymentAmount: 0, // Add this line
    dueAmount: 0,
  });

  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    const fetchLatestOrderNumber = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/payment/latestOrderNumber');
        const latestOrderNumber = response.data.latestOrderNumber;
        setOrderNumber(`${latestOrderNumber}`);
      } catch (error) {
        console.error('Error fetching latest order number:', error);
      }
    };

    fetchLatestOrderNumber();
  }, [tableName, totalAmount]);

  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      totalAmount,
      dueAmount: totalAmount - prevFormData.cashAmount,
    }));
  }, [totalAmount]);

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/payment/payments', {
        ...formData,
        orderNumber,
        tableId,
        totalAmount,
      });

      console.log('Payment successful:', response.data);
      onClose();
      router.push('/bill')
    } catch (error) {
      console.error('Error making payment:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleCashAmountChange = (e) => {
    const cashAmount = parseFloat(e.target.value) || 0;
    const onlinePaymentAmount = parseFloat(formData.onlinePaymentAmount) || 0;
    const dueAmount = formData.totalAmount - (cashAmount + onlinePaymentAmount);

    setFormData((prevFormData) => ({
      ...prevFormData,
      cashAmount: cashAmount.toFixed(2),
      onlinePaymentAmount: onlinePaymentAmount.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
    }));
  };

  const handleCashOnlineChange = (e) => {
    const onlinePaymentAmount = parseFloat(e.target.value) || 0;
    const cashAmount = parseFloat(formData.cashAmount) || 0;
    const dueAmount = formData.totalAmount - (cashAmount + onlinePaymentAmount);

    setFormData((prevFormData) => ({
      ...prevFormData,
      onlinePaymentAmount: onlinePaymentAmount.toFixed(2),
      cashAmount: cashAmount.toFixed(2),
      dueAmount: dueAmount.toFixed(2),
    }));
  };

  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Payment for {tableName}</h1>
            <form onSubmit={handlePayment} className="max-w-md mx-auto">
              <div className="mb-4">
                <input
                  type="hidden"
                  name="tableId"
                  value={formData.tableId}
                  onChange={handleChange}
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Total Amount
                </label>
                <input
                  type="text"
                  id="totalAmount"
                  name="totalAmount"
                  value={`${Math.ceil(Number(totalAmount).toFixed(2))}`}
                  

                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={orderNumber}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500"
                />
              </div>
              {/* my work */}
              <div>
                <h1 className='text-center font-bold mb-5'>Payment Method</h1>
                <div className="flex flex-col gap-4 md:flex-row justify-center">

                  <div>
                    <div className="flex items-center mb-2  justify-between">
                      <label htmlFor="cash_payment" className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2">
                        Cash Payment
                      </label>
                      <input
                        type="text"
                        id="cash_amount"
                        onChange={handleCashAmountChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 mr-8 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="00"
                      />
                    </div>

                    <div className="flex items-center mb-2 justify-between">
                      <label htmlFor="online_payment" className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2">
                        Online Payment
                      </label>
                      <input
                        type="text"
                        id="online_payment"
                        onChange={handleCashOnlineChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 mr-8 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="00"
                      />
                    </div>

                    <div className="flex items-center mb-2 justify-between">
                      <label htmlFor="due_amount" className="text-sm font-medium text-gray-900 dark:text-gray-300 mr-2">
                        Due Amount
                      </label>
                      <input
                        type="text"
                        id="due_amount"
                        name="dueAmount"
                        value={`${Math.ceil(Number(formData.dueAmount).toFixed(2))}`}
                        // value={`₹${Number(formData.dueAmount).toFixed(2)}`}

                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-36 p-2.5 mr-8 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 float-right"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/*  */}
              <button
                type="submit"
                className="w-full py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none"
              >
                Process Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal