'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PaymentModal from '../payment/page';

const Billing = ({ tableId }) => {
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [tableInfo, setTableInfo] = useState(null); // New state for table information
  const [hotelInfo, setHotelInfo] = useState(null); // New state for hotel information
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef(null); // Create a ref for the search input element
  const menuItemRefs = useRef([]);
  const router = useRouter()
  const [latestBillAmount, setLatestBillAmount] = useState(null);

  // fetch the last bill amount only
  useEffect(() => {
    // Fetch the latest bill amount when the component mounts
    fetchLatestBillAmount();
  }, [latestBillAmount]);

  // Last bill amount function
  const fetchLatestBillAmount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payment/latestBillAmount');
      setLatestBillAmount(response.data.latestBillAmount);
    } catch (error) {
      console.error('Error fetching latest bill amount:', error);
    }
  };


  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      // Redirect to the dashboard or any desired location
      router.push('/bill');
    }
  }, [router]);

  const handleSearchInputKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      // Set focus on the first menu item
      if (menuItemRefs.current.length > 0) {
        menuItemRefs.current[0].focus();
      }
    }
  };

  // Search filter
  const filterMenus = (menu) => {
    const searchTerm = searchInput.toLowerCase().trim();

    // If the search term is empty, show all menus
    if (searchTerm === '') {
      return true;
    }

    // Check if the search term is a number
    const searchTermIsNumber = !isNaN(searchTerm);

    // If the search term is a number, filter based on menu's uniqueId
    if (searchTermIsNumber) {
      return menu.uniqueId === searchTerm;
    }

    // If the search term is not a number, filter based on menu's name
    return menu.name.toLowerCase().includes(searchTerm);
  };


  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  const saveBill = async () => {
    try {
      const orderData = {
        tableId,
        items: currentOrder.map((orderItem) => ({
          name: orderItem.name,
          quantity: orderItem.quantity,
          price: orderItem.price,
        })),
        subtotal: calculateTotal().subtotal,
        CGST: calculateTotal().CGST,
        SGST: calculateTotal().SGST,
        total: calculateTotal().total,
      };

      // Check if there's an existing bill for the current table
      const existingBillResponse = await axios.get(`http://localhost:5000/api/order/order/${tableId}`);
      const existingBill = existingBillResponse.data;

      let existingItems = [];

      if (existingBill && existingBill.length > 0) {
        // If an existing bill is found, get the orderId
        const orderIdToUpdate = existingBill[0]._id;

        // Get existing menu items
        existingItems = existingBill[0].items;

        // Update the existing order by orderId
        const updateResponse = await axios.patch(`http://localhost:5000/api/order/update-order-by-id/${orderIdToUpdate}`, orderData);
        console.log('Update Response:', updateResponse.data);
      } else {
        // If no existing bill is found, create a new one
        const createResponse = await axios.post(`http://localhost:5000/api/order/order/${tableId}`, orderData);
        console.log('Create Response:', createResponse.data);
      }

      // Identify newly added items
      const newItems = orderData.items.filter((newItem) => !existingItems.some((existingItem) => existingItem.name === newItem.name));

      // Identify items with updating quantities for existing items
      const updatingItems = orderData.items.map((newItem) => {
        const existingItem = existingItems.find((item) => item.name === newItem.name);
        return {
          name: newItem.name,
          quantity: existingItem ? newItem.quantity - existingItem.quantity : newItem.quantity,
        };
      }).filter((orderItem) => orderItem.quantity !== 0); // Filter out items with quantity 0

      // Combine newItems and updatingItems into a set of unique items
      const uniqueItems = [...newItems, ...updatingItems];
      const uniqueItemsSet = new Set(uniqueItems.map((item) => item.name));

      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        alert("Please allow pop-ups to print the KOT.");
        return;
      }

      // Print KOT for unique items
      const kotContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kitchen Order Ticket (KOT)</title>
          <style>
            @page {
              margin: 2mm; /* Adjust the margin as needed */
            }
            /* Add your custom styles for KOT print here */
            body {
              font-family: Arial, sans-serif;
              margin:2px;
              padding:0;
              margin-bottom:5px;
            }
            .kot-header {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              width:100%
              align-items:center
              margin-left:2rem
            }
            .kot-item {
              margin-bottom: 5px;
              margin-left:3rem
            }
            
          br{
            margin-top:1rem
          }
          </style>
        </head>
        <body>
          <div class="kot-header">
           (KOT)  <br/> Table No.${tableInfo ? tableInfo.tableName : 'Table Not Found'}
          </div>
          <div class="kot-items">
            ${[...uniqueItemsSet].map((itemName) => {
        const orderItem = uniqueItems.find((item) => item.name === itemName);
        return `
                <div class="kot-item">
                  <span>${orderItem.name}</span>
                  <span style="margin-left: 20px;"> X ${orderItem.quantity}</span>
                </div>
              `;
      }).join('')}
          </div>
        </body>
      </html>
    `;

      // Write the content to the new window or iframe
      printWindow.document.write(kotContent);

      // Trigger the print action
      printWindow.document.close();
      printWindow.print();

      // Close the print window or iframe after printing
      printWindow.close();
      // Print or further process the KOT content as needed
      console.log(kotContent);

      // Save order to the local storage
      const savedBills = JSON.parse(localStorage.getItem(`savedBills_${tableId}`)) || [];
      savedBills.push(orderData);
      localStorage.setItem(`savedBills_${tableId}`, JSON.stringify(savedBills));

      // Optionally, you can reset the current order or perform other actions
      setCurrentOrder([]);
      router.push('/bill');
    } catch (error) {
      console.error('Error saving bill:', error);
    }
  };



  const handlePrintBill = async () => {
    try {
      // Check if there's an existing bill for the current table
      const existingBillResponse = await axios.get(`http://localhost:5000/api/order/order/${tableId}`);
      const existingBill = existingBillResponse.data;

      // Find the index of the first temporary order (if any)
      const temporaryOrderIndex = existingBill.findIndex((order) => order.isTemporary);

      // Use the tableId from the order data
      const orderData = {
        tableId: existingBill.tableId,
        items: currentOrder.map((orderItem) => ({
          name: orderItem.name,
          quantity: orderItem.quantity,
          price: orderItem.price,
        })),
        subtotal: calculateTotal().subtotal,
        CGST: calculateTotal().CGST,
        SGST: calculateTotal().SGST,
        total: calculateTotal().total,
        isTemporary: false, // Set isTemporary to false explicitly
      };

      if (temporaryOrderIndex !== -1) {
        // If an existing temporary order is found, update it
        const orderIdToUpdate = existingBill[temporaryOrderIndex]._id;
        await axios.patch(`http://localhost:5000/api/order/update-order-by-id/${orderIdToUpdate}`, {
          ...orderData,
          isTemporary: false, // Ensure isTemporary is set to false in the update request
        });
      } else {
        // If no existing temporary order is found, create a new one
        await axios.post(`http://localhost:5000/api/order/order/${tableId}`, orderData);
      }

      // Remove the local storage item for the specific table
      localStorage.removeItem(`savedBills_${tableId}`);

      // await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("document ready for printing")

      const printWindow = window.open('', '_blank');

      if (!printWindow) {
        alert("Please allow pop-ups to print the bill.");
        return;
      }

      const printContent = `
      <html>
  <head>
    <title>Bill</title>
    <style>
      @page {
        margin: 2mm; /* Adjust the margin as needed */
      }
      body {
        font-family: 'Arial', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
        font-size:9px
      }
      .container {
       max-width:600px
        padding:10px 10px
        justify-content:center
        aligh-items:center
        text-align:center
        font-size:10px
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .logo {
        display: flex;
        justify-content: center;
        margin-bottom: 10px;
      }
      .logo img {
        width: 5px;
        height: 50px;
        object-fit: cover;
       
      }
      .hotel-details h1 {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
      }
      .hotel-details p {
        font-size: 12px;
        margin-bottom: 10px;
        text-align: center;
      }
      .table-details, .contact-details {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
      }
      .order-details {
        margin-top: 2px;
      }
      .invoice-header {
        text-align: center;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 1px;
      }
      table {
        width: 95%;
        border-collapse: collapse;
        margin-top: 0px;
        margin-left: 5px;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 2px;
        text-align: center;
        font-size: 10px;
      }
      .total-section {
        margin-top: 5px;
        text-align: right;
        border:none
      }
      .total-section table {
        width: 50%;
        margin: 0;
      }
      .total-section td {
        padding: 2px;
        font-weight: bold;
        font-size:9px
      }
      .qr-code {
        text-align: center;
       
      }
      .qr-code img {
        width: 50px;
        height: 50px;
        object-fit: contain;
        text-align: center;
        margin-top:10px
        margin-bottom:1rem

      }
      .thank-you {
        font-weight: bold;
        text-align: center;
        margin-top:5px
        font-size:9px
      }
      .contact-details{
        flex-direction:coloums
        display:flex
        width:50%
        padding:10px
      }
      .order_details_border table tr,td,th{
        border:2px solid black
      }
      .total-section {
        display: flex;
        justify-content:end;
        width:100%
        font-size:9px
      }
      
      .total-section table {
        border-collapse: collapse;
        align-items:left
        font-size:9px
      }
      
      .total-section table,
      .total-section td {
        border: none;
        margin-top:-2rem
      
      }
     .total-section .total-label {
        font-size: 12px; 
        margin-total:5px
      
      
      }
      .total-section  .total-value {
        font-size: 12px; 
        margin-total:5px
        
      }
     .contact-details .flex {
        width:100%
        display: flex;
        flex-direction: coloum; /* Set to 'row' to display items horizontally */
        justify-content: space-between; /* Distribute items equally across the container */
        align-items: center; /* Center items vertically within the container */
      }
    .table_top{
      margin-top:-20px
    }
  
   .order_details_border .top_p{
    margin-left:10px
      position:relative
      top:2rem
    }

   .container .total-section{
      justify-content:space-between
      display:flex
    }
    .margin_left_container{
      margin-left:-2rem
    }
    .container{
     maegin:1rem
     align-items: center;
     height:fit
   

    }
    </style>
  </head>
  <body>
    <!-- Your specific JSX code for printing -->
    <div class="container">
      
      <div class="hotel-details">
        <h1>${hotelInfo ? hotelInfo.hotelName : 'Hotel Not Found'}</h1>
        <p>${hotelInfo ? hotelInfo.address : 'Hotel Not Found'}</p>
      </div>
    <div class="table-details">Table No: ${tableInfo ? tableInfo.tableName : 'Table Not Found'}</div>
    <div class="contact-details">
     
    </div>

      <!-- Order Details -->
    <div class="order-details">
      <div class="order_details_border">
        <h2 class="invoice-header">Bill</h2>
      
        <table>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Menu Name</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
            
          </thead>
          <tbody>

          <p class="top_p"> MOBILE NO: ${hotelInfo ? hotelInfo.contactNo : 'Fssai not found'}</p>
          <div class="margin_left_container">
            ${currentOrder.map((orderItem, index) => (
        `<tr key=${orderItem._id}>
                <td>${index + 1}</td>
                <td>${orderItem.name}</td>
                <td>${orderItem.quantity}</td>
                <td>${`${(orderItem.price * orderItem.quantity).toFixed(2)}`}</td>
              </tr>`
      ))}
          </tbody>
        </table>
        </div>
      </div>
      <div class="flex">
      <p> FSSAI NO: ${hotelInfo ? hotelInfo.fssaiNo : 'Fssai not found'} </p>
      <p>  SAC NO: ${hotelInfo ? hotelInfo.sacNo : 'Fssai not found'} </p>
      </div>
        <!-- Total Section -->
        <div class="total-section">
       
          <table>
            <tbody>
              <tr>
                <td>Subtotal :</td>
                <td>${`${calculateTotal().subtotal}`}</td>
              </tr>
              <tr>
                <td>CGST :</td>
                <td>${`${calculateTotal().CGST}`}</td>
              </tr>
              <tr>
                <td>SGST :</td>
                <td>${`${calculateTotal().SGST}`}</td>
              </tr>
              <tr>
                <td class="total-label"> Grand Total :</td>
                <td class="total-value">${`${calculateTotal().total}`}</td>
              </tr>
            </tbody>
          </table>
        </div>
 

      <div class="qr-code">
        ${hotelInfo && hotelInfo.qrCode && (
          `<img src="http://localhost:5000/${hotelInfo.qrCode}" alt="QR Code" />`
        )}
      </div>
      <div class="thank-you">Thank You Visit Again !!!</div>
    </div>
    </div>
  </body>
</html>

    `;

      // Write the content to the new window or iframe
      printWindow.document.write(printContent);

      // Trigger the print action
      printWindow.document.close();
      printWindow.print();

      // Close the print window or iframe after printing
      printWindow.close();

      // Open the payment modal after printing
      openPaymentModal();
    } catch (error) {
      console.error('Error preparing order:', error);
    }
  };

  const handleAfterPrint = () => {
    window.removeEventListener('afterprint', handleAfterPrint)
    window.close()
  }

  const addToOrder = useCallback((product) => {
    console.log('Adding to order:', product);


    // Update the current order
    setCurrentOrder((prevOrder) => {
      const existingItem = prevOrder.find((item) => item.name === product.name);

      if (existingItem) {
        console.log('Adding to existing item:', existingItem);
        const updatedOrder = prevOrder.map((item) =>
          item.name === existingItem.name ? { ...item, quantity: item.quantity + 1 } : item
        );
        console.log('Updated Order:', updatedOrder);
        return updatedOrder;
      } else {
        console.log('Adding new item:', product);
        return [...prevOrder, { ...product, quantity: 1 }];
      }
    });

    // Optionally, you can trigger the KOT print here or use the `kotData` as needed.
  }, [setCurrentOrder]);



  const removeFromOrder = (product) => {
    setCurrentOrder((prevOrder) => {
      const existingItem = prevOrder.find((item) => item.name === product.name);

      if (existingItem) {
        const updatedOrder = prevOrder.map((item) =>
          item.name === existingItem.name
            ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 0 }
            : item
        );

        // Filter out items with quantity greater than 0
        const filteredOrder = updatedOrder.filter((item) => item.quantity > 0);

        return filteredOrder;
      } else {
        console.log('Item not found in order:', product);
        return prevOrder;
      }
    });
  };


  useEffect(() => {

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    // Fetch categories
    axios.get('http://localhost:5000/api/main')
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });

    // Fetch products
    axios.get('http://localhost:5000/api/menu/menus/list')
      .then(response => {
        console.log(response.data);
        const menusArray = response.data; // Ensure menus is an array
        setMenus(menusArray);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });

    if (tableId) {
      axios.get(`http://localhost:5000/api/table/tables/${tableId}`)
        .then(response => {
          setTableInfo(response.data);
        })
        .catch(error => {
          console.error('Error fetching table information:', error);
        });
    }

    const savedBills = JSON.parse(localStorage.getItem(`savedBills_${tableId}`)) || [];
    if (savedBills.length > 0) {
      // Assuming you want to load the latest saved bill
      const latestOrder = savedBills[savedBills.length - 1];
      setCurrentOrder(latestOrder.items || []); // Initialize currentOrder with the saved items
    }

    document.addEventListener('keydown', handleKeyDown);
    // document.addEventListener('keydown', handleSlashKey);

    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // document.removeEventListener('keydown', handleSlashKey);

    };
  }, [tableId, handleKeyDown]);


  useEffect(() => {
    const handleStarKey = (event) => {
      if (event.key === '*') {
        event.preventDefault();
        handlePrintBill();
      }
    };
    document.addEventListener('keydown', handleStarKey);
    return () => {
      document.removeEventListener('keydown', handleStarKey);
    }
  }, [handlePrintBill])

  useEffect(() => {
    const handleSlashKey = (event) => {
      if (event.key === '/') {
        event.preventDefault();
        saveBill();
      }
    };
    document.addEventListener('keydown', handleSlashKey);
    return () => {
      document.removeEventListener('keydown', handleSlashKey);
    }
  }, [saveBill])

  useEffect(() => {
    // Fetch menus based on the selected category
    if (selectedCategory) {
      axios.get(`http://localhost:5000/api/menu/${selectedCategory._id}`)
        .then(response => {
          console.log(response.data);
          const menusArray = response.data || []; // Ensure menus is an array
          setMenus(menusArray);
        })
        .catch(error => {
          console.error('Error fetching menus:', error);
        });
    }
  }, [selectedCategory]);


  const handleCategoryClick = (category) => {
    setSelectedCategory(category);

    // If the category is null (All items), fetch all menus
    if (category === null) {
      axios.get('http://localhost:5000/api/menu/menus/list')
        .then(response => {
          setMenus(response.data);
        })
        .catch(error => {
          console.error('Error fetching menus:', error);
        });
    } else {
      // Fetch menus based on the selected category
      axios.get(`http://localhost:5000/api/menu/menulist/${category._id}`)
        .then(response => {
          setMenus(response.data);
        })
        .catch(error => {
          console.error('Error fetching menus:', error);
        });
    }
  };

  const calculateTotal = () => {
    const subtotal = currentOrder.reduce((acc, orderItem) => acc + orderItem.price * orderItem.quantity, 0);
    // const discount = 5.00; // You can replace this with your discount logic
    const GSTRate = 0.025; // GST rate of 2.5%
    const CGST = GSTRate * subtotal; // Central GST
    const SGST = GSTRate * subtotal; // State GST
    const total = subtotal + CGST + SGST;
    const totalQuantity = currentOrder.reduce((acc, orderItem) => acc + orderItem.quantity, 0);

    return {
      subtotal: subtotal.toFixed(2),
      SGST: SGST.toFixed(2),
      CGST: CGST.toFixed(2),
      total: total.toFixed(2),
      totalQuantity: totalQuantity, // Add total quantity

    };
  };

  const handleMenuItemKeyDown = (event, product) => {
    if (event.key === 'Enter') {
      addToOrder(product);

    } else if (event.key === 'Tab') {
      event.preventDefault();
      setSearchInput('');

      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }

    } else if (event.key === 'Backspace') {
      event.preventDefault();
      removeFromOrder(product);
    }
  };



  useEffect(() => {
    const hotelId = '658670d85a2771b404ca944d';

    const fetchHotelInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/hotel/get/${hotelId}`);
        setHotelInfo(response.data);
      } catch (error) {
        console.error('Error fetching hotel information:', error);

        // Log additional information about the error
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received. Request:', error.request);
        } else {
          console.error('Error setting up the request:', error.message);
        }
      }
    };

    fetchHotelInfo();
  }, []); // Empty dependency array ensures the effect runs only once on mount




  return (
    <div className='bg-blue-400 font-sans'>
      {/* <!-- component --> */}
      <div className="container mx-auto px-5 bg-white">
        <div className="flex lg:flex-row flex-col-reverse shadow-lg">
          {/* <!-- left section --> */}
          <div className="w-full lg:w-3/5 min-h-screen shadow-lg ">
            {/* <!-- header --> */}
            <div className="flex flex-row justify-between items-center px-5 mt-2">
              <div className="text-gray-800">
                <div className="font-bold text-xl">{hotelInfo?.hotelName}</div>
                <span className="text-xs">{hotelInfo?.address}</span>
              </div>
              <div className="flex items-center">
                <div className="text-xs text-center mr-4">
                  {/* <div className="font-light text-gray-500">last synced</div>
                  <span className="font-semibold">2 mins ago</span> */}
                </div>
                <div>
                  <Link href={'/bill'} className="px-4 py-2 bg-blue-200 text-blue-600 font-semibold rounded-full">
                    Tables
                  </Link>

                </div>
              </div>
            </div>
            {/* <!-- end header --> */}

            {/* <!-- categories --> */}
            <div className="mt-5 flex flex-row px-5 overflow-x-auto whitespace-nowrap">
              <span
                key="all-items"
                className={`cursor-pointer px-5 py-1 rounded-2xl text-sm font-semibold mr-4 ${selectedCategory === null ? 'bg-blue-100 text-blue-500' : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                All Menu
              </span>
              {categories.map(category => (
                <span
                  key={category._id}
                  className={`whitespace-nowrap cursor-pointer px-5 py-1 rounded-2xl text-sm font-semibold ${selectedCategory === category ? 'bg-blue-100 text-blue-500' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.name}
                </span>
              ))}
            </div>

            <div className="mt-5 flex justify-start px-5">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search Menu / Id..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 w-48"
              />

            </div>
            {/* <!-- end categories --> */}
            {/* <!-- products --> */}
            <div className="cursor-pointer grid grid-cols-4 gap-4 px-5 mt-5 overflow-scroll h-96 text-sm">
              {(menus.menus || menus)
                .filter(filterMenus) // Apply the filterMenus function
                .map((product, index) => (
                  <div
                    key={product._id}
                    className="px-3 py-3 flex flex-col border border-gray-200 rounded-md h-32 justify-between"
                    onClick={() => addToOrder(product)}
                    tabIndex={0}
                    ref={(el) => (menuItemRefs.current[index] = el)} // Save the ref to the array
                    onKeyDown={(e) => handleMenuItemKeyDown(e, product)} // Handle keydown event                
                  >
                    <div>
                      <div className="font-bold text-gray-800">{product.name}</div>
                      {/* <span className="font-light text-sm text-gray-400">{product.description}</span> */}
                      <div className="font-light text-xs text-gray-900">{`Menu Id: ${product.uniqueId || 'Yes'}`}</div>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                      <span className="self-end font-bold text-lg text-blue-600">{`₹${product.price}`}</span>
                      <img
                        src={`/tray.png`}
                        className="h-10 w-10 object-cover rounded-md"
                        alt=""
                      />
                    </div>
                  </div>
                ))}
            </div>
            {/* <!-- end products --> */}
          </div>
          {/* <!-- end left section --> */}


          {/* <!-- right section --> */}
          <div className="w-full lg:w-2/5">
            {/* <!-- header --> */}
            <div className="flex flex-row items-center justify-between px-5 mt-5">
              <div className="font-bold text-xl">Order</div>
              <div className="font-semibold text-sm ">
                {/* <span className="px-4 py-2 rounded-md bg-red-100 text-red-500">Clear All</span> */}
                <span className="px-4 py-2 rounded-md bg-slate-100 text-gray-800 border ">
                  Last Bill : {Math.ceil(Number(latestBillAmount)).toFixed(2)}
                </span>
              </div>
            </div>
            {/* <!-- end header --> */}
            {/* <!-- order list --> */}
            <div className="px-5 py-4 mt-5 overflow-y-auto h-64">
              {currentOrder.map((orderItem) => (
                <div key={orderItem._id} className="flex flex-row justify-between items-center mb-4">
                  <div className="flex flex-row items-center w-2/5">
                    <div className="flex items-center h-full">
                      <img
                        // src={`http://localhost:5000/${orderItem.imageUrl}`}
                        src={`/tray.png`}
                        className="w-7 h-7 object-cover rounded-md"
                        alt=""
                      />
                      <span className="ml-4 font-semibold text-sm">{orderItem.name}</span>
                    </div>
                  </div>
                  <div className="w-32 flex justify-between">
                    <span
                      className="px-3 py-1 rounded-md bg-gray-300 cursor-pointer"
                      onClick={() => removeFromOrder(orderItem)}
                    >
                      -
                    </span>
                    <span className="font-semibold mx-4">{orderItem.quantity}</span>
                    <span
                      className="px-3 py-1 rounded-md bg-gray-300 cursor-pointer"
                      onClick={() => addToOrder(orderItem)}
                    >
                      +
                    </span>
                  </div>
                  <div className="font-semibold text-lg w-16 text-center">
                    {`₹${(orderItem.price * orderItem.quantity).toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>

            {/* <!-- end order list --> */}
            {/* <!-- totalItems --> */}
            <div className="px-5 mt-5">
              <div className="py-4 rounded-md shadow-lg">
                <div className="px-4 flex justify-between ">
                  <span className="font-semibold text-sm">Subtotal</span>
                  <span className="font-bold">₹{calculateTotal().subtotal}</span>
                </div>

                <div className="px-4 flex justify-between ">
                  <span className="font-semibold text-sm">CGST</span>
                  <span className="font-bold">₹{calculateTotal().CGST}</span>
                </div>
                <div className="px-4 flex justify-between ">
                  <span className="font-semibold text-sm">SGST</span>
                  <span className="font-bold">₹{calculateTotal().SGST}</span>
                </div>
                <div className="border-t-2 mt-3 py-2 px-4 flex items-center justify-between">
                  <span className="font-semibold text-2xl">Total</span>
                  {/* <span className="font-bold text-2xl">₹{calculateTotal().total}</span> */}
                  <span className="font-bold text-2xl">₹{Math.ceil(Number(calculateTotal().total)).toFixed(2)}</span>

                </div>
              </div>
            </div>
            {/* <!-- end total --> */}
            <div className="px-5 text-left text-sm text-gray-500 font-sans font-semibold">
              Total Items: {calculateTotal().totalQuantity}
            </div>

            {/* <!-- button pay--> */}
            <div className="flex px-5 mt-2 justify-between">
              <div
                className="px-8 py-2 rounded-md shadow-lg text-center bg-orange-100 text-orange-500 font-bold cursor-pointer text-sm"
                onClick={saveBill}
              >
                KOT
              </div>
              <div
                className="px-8 py-2 rounded-md shadow-lg text-center bg-green-100 text-green-600 font-bold cursor-pointer text-sm"
                onClick={handlePrintBill}
              >
              Bill
              </div>
            </div>

            {isPaymentModalOpen && (
              <PaymentModal
                onClose={() => setIsPaymentModalOpen(false)}
                tableName={tableInfo ? tableInfo.tableName : 'Table Not Found'}
                totalAmount={calculateTotal().total}
                tableId={tableId}

              />
            )}

          </div>
          {/* <!-- end right section --> */}
        </div>
      </div>
    </div>
  )
}

export default Billing