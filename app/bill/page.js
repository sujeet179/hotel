
// "use client";

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Navbar from "../components/Navbar";
// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTable } from "@fortawesome/free-solid-svg-icons";
// import Image from "next/image";

// const Bill = () => {
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [tables, setTables] = useState([]);
//   const [sections, setSections] = useState([]);
//   const [bills, setBills] = useState({});
//   const [displayedTables, setDisplayedTables] = useState([]);
//   const [defaultSectionId, setDefaultSectionId] = useState(null);

//   const handleSectionRadioChange = (sectionId) => {
//     setSelectedSection(sectionId);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const sectionsResponse = await axios.get(
//           "http://localhost:5000/api/section"
//         );
//         setSections(sectionsResponse.data);

//         const tablesResponse = await axios.get(
//           "http://localhost:5000/api/table/tables"
//         );
//         setTables(tablesResponse.data);

//         const defaultSection = sectionsResponse.data.find(
//           (section) => section.isDefault
//         );
//         if (defaultSection) {
//           setDefaultSectionId(defaultSection._id);
//           setSelectedSection(defaultSection._id);
//         }

//         const billsData = await Promise.all(
//           tablesResponse.data.map(async (table) => {
//             const billsResponse = await axios.get(
//               `http://localhost:5000/api/order/order/${table._id}`
//             );
//             const temporaryBills = billsResponse.data.filter(
//               (bill) => bill.isTemporary
//             );
//             const latestBill =
//               temporaryBills.length > 0 ? temporaryBills[0] : null;
//             return { [table._id]: latestBill };
//           })
//         );

//         const mergedBills = Object.assign({}, ...billsData);
//         setBills(mergedBills);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     const updateDisplayedTables = () => {
//       if (selectedSection) {
//         const filteredTables = tables.filter(
//           (table) => table.section._id === selectedSection
//         );
//         setDisplayedTables(filteredTables);
//       } else if (defaultSectionId) {
//         const defaultTables = tables.filter(
//           (table) => table.section._id === defaultSectionId
//         );
//         setDisplayedTables(defaultTables);
//       } else {
//         setDisplayedTables([]);
//       }
//     };

//     updateDisplayedTables();
//   }, [selectedSection, defaultSectionId, tables]);

//   return (
//     <div>
//       <Navbar />
//       <div className="container mx-auto px-10 md:px-1 lg:px-1 xl:px-1 justify-around font-sans">
//         <h1 className="text-xl md:text-x1 lg:text-2xl font-semibold mb-4">
//           Billing
//         </h1>

//         <div>
//           <ul className="flex flex-col md:flex-row md:justify-between rounded-2xl ">
//             {sections.map((section) => (
//               <li key={section._id} className="mb-2 md:mb-0 bg-indigo-700 p-1 rounded-2xl px-4 hover:bg-indigo-500">
//                 <input
//                   className="cursor-pointer"
//                   type="radio"
//                   id={section._id}
//                   name="section"
//                   checked={selectedSection === section._id}
//                   onChange={() => handleSectionRadioChange(section._id)}
//                 />
//                 <label
//                   className="cursor-pointer block md:inline-block bg-indigo-700 p-2 text-white hover:bg-indigo-500"
//                   htmlFor={section._id}
//                 >
//                   {section.name}
//                 </label>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-7 mt-8 p-2">
//           {displayedTables.map((table) => (
//             <Link key={table._id} href={`http://localhost:3000/order/${table._id}`}>
//               <h3 className="text-lg md:text-xl lg:text-2xl font-semibold -mt-3">
//                 {table.tableName}
//               </h3>
//               <div
//                 className={`bg-white overflow-y-auto p-2 rounded-md border-2 ${bills[table._id]?.isTemporary
//                     ? "border-orange-400"
//                     : "border-gray-500"
//                   } w-full h-44 transform transition-transform hover:scale-150`}
//               >
//                 {bills[table._id] && bills[table._id].isTemporary ? (
//                   <>
//                     {bills[table._id].items.map((item, index) => (
//                       <div key={index} className="text-xs text-blue-900 font-semibold">
//                         {item.name} = {item.quantity}
//                       </div>
//                     ))}
//                     <div className="font-semibold mt-3 text-xs text-blue-800">
//                       Amount: {bills[table._id].total}
//                     </div>
//                   </>
//                 ) : (
//                   <div className="flex justify-center items-center text-center h-36">
//                     <Image src="/dinner-table.png" alt="logo" height={60} width={60} />
//                   </div>
//                 )}
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Bill;

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTable } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

const Bill = () => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [tables, setTables] = useState([]);
  const [sections, setSections] = useState([]);
  const [bills, setBills] = useState({});
  const [displayedTables, setDisplayedTables] = useState([]);
  const [defaultSectionId, setDefaultSectionId] = useState(null);

  const handleSectionRadioChange = (sectionId) => {
    setSelectedSection(sectionId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionsResponse = await axios.get(
          "http://localhost:5000/api/section"
        );
        setSections(sectionsResponse.data);

        const tablesResponse = await axios.get(
          "http://localhost:5000/api/table/tables"
        );
        setTables(tablesResponse.data);

        const defaultSection = sectionsResponse.data.find(
          (section) => section.isDefault
        );
        if (defaultSection) {
          setDefaultSectionId(defaultSection._id);
          setSelectedSection(defaultSection._id);
        }

        const billsData = await Promise.all(
          tablesResponse.data.map(async (table) => {
            const billsResponse = await axios.get(
              `http://localhost:5000/api/order/order/${table._id}`
            );
            const temporaryBills = billsResponse.data.filter(
              (bill) => bill.isTemporary
            );
            const latestBill =
              temporaryBills.length > 0 ? temporaryBills[0] : null;
            return { [table._id]: latestBill };
          })
        );

        const mergedBills = Object.assign({}, ...billsData);
        setBills(mergedBills);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateDisplayedTables = () => {
      if (selectedSection) {
        const filteredTables = tables.filter(
          (table) => table.section._id === selectedSection
        );
        setDisplayedTables(filteredTables);
      } else if (defaultSectionId) {
        const defaultTables = tables.filter(
          (table) => table.section._id === defaultSectionId
        );
        setDisplayedTables(defaultTables);
      } else {
        setDisplayedTables([]);
      }
    };

    updateDisplayedTables();
  }, [selectedSection, defaultSectionId, tables]);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-10 md:px-1 lg:px-1 xl:px-1 justify-around font-sans mt-20">
        {/* <h1 className="text-xl md:text-x1 lg:text-2xl font-semibold mb-4">
          Billing
        </h1> */}

        <div>
          <ul className="flex flex-col md:flex-row md:justify-between rounded-2xl ">
            {sections.map((section) => (
              <li key={section._id} className="mb-2 md:mb-0 bg-indigo-100 p-1 rounded-full px-4">
                <input
                  className="cursor-pointer"
                  type="radio"
                  id={section._id}
                  name="section"
                  checked={selectedSection === section._id}
                  onChange={() => handleSectionRadioChange(section._id)}
                />
                <label
                  className="cursor-pointer block md:inline-block p-2 text-indigo-700 font-medium"
                  htmlFor={section._id}
                >
                  {section.name}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-8 gap-7 mt-2 p-9">
          {displayedTables.map((table) => (
            <Link key={table._id} href={`http://localhost:3000/order/${table._id}`}>
              <h3 className="text-lg md:text-xl lg:text-2xl font-semibold -mt-3">
                {table.tableName}
              </h3>
              <div
                className={`bg-white overflow-y-auto p-2 rounded-md border-2 ${bills[table._id]?.isTemporary
                    ? "border-green-500"
                    : "border-gray-500"
                  } w-full h-44 transform transition-transform hover:scale-150`}
              >
                {bills[table._id] && bills[table._id].isTemporary ? (
                  <>
                    {bills[table._id].items.map((item, index) => (
                      <div key={index} className="text-xs text-blue-900 font-semibold">
                        {item.name} = {item.quantity}
                      </div>
                    ))}
                    <div className="font-semibold mt-3 text-xs text-blue-800">
                      Amount: {bills[table._id].total}
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center items-center text-center h-36">
                    <Image src="/plate.png" alt="logo" height={60} width={60} />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bill;
