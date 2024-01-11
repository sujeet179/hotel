"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEye,
  faHouse,
  faPenToSquare,
  faPlus,
  faTrash,
  faAnglesRight,
  faAnglesLeft,
} from "@fortawesome/free-solid-svg-icons";
import ReactPaginate from "react-paginate";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import Square from "../components/square";

const MainMenuList = () => {
  const [menus, setMenus] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [completeImageUrl, setPreviewImageUrl] = useState("");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedMenuImage, setEditedMenuImage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);

  const router = useRouter();
  const [newMenu, setNewMenu] = useState({
    name: "",
    // Add other fields here
  });
  const [newMenuImage, setNewMenuImage] = useState(null);
  const [mainCategoryToView, setMainCategoryToView] = useState(null);
  const [isViewMainCategoryModalOpen, setIsViewMainCategoryModalOpen] =
    useState(false);

    const handleViewMainCategory = async (mainCategory) => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/main/${mainCategory._id}`
        );
        const mainCategoryData = response.data;
        console.log("Main Category Data:", mainCategoryData);
    
        // Set main category data to view
        setMainCategoryToView(mainCategoryData);
    
        // Open the view modal
        setIsViewMainCategoryModalOpen(true);
      } catch (error) {
        console.error("Error fetching main category details:", error);
      }
    };
    

    const handleAddSubmit = async () => {
      try {
        const formData = new FormData();
        formData.append("name", newMenu.name);
    
        if (newMenuImage) {
          formData.append("mainImage", newMenuImage);
        }
    
        const response = await axios.post(
          "http://localhost:5000/api/main",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
    
        const addedMainCategory = response.data;
    
        // Update both menus and searchResults
        setMenus((prevMenus) => [...prevMenus, addedMainCategory]);
        setSearchResults((prevSearchResults) => [...prevSearchResults, addedMainCategory]);
    
        // Clear the form state
        setNewMenu({
          name: "",
        });
        setNewMenuImage(null);
    
        // Close the add modal if needed
        setIsNewModalOpen(false);
    
        // Reset page number to 0
        // setPageNumber(0);
    
      } catch (error) {
        console.error("Error adding main category:", error);
      }
    };
    const handleDelete = (menu) => {
      setEditedMenu(menu); // Set the menu to be deleted
      setIsDeleteConfirmationModalOpen(true);
    };
    const  handleDeleteConfirmed = async (menu) => {
      try {
        // Check if menu is not null or undefined
        if (!menu) {
          console.error("Menu is null or undefined");
          return;
        }
    
        const response = await axios.delete(
          `http://localhost:5000/api/main/${menu._id}`
        );
    
        // Check if response.data and deletedMainCategory are not null or undefined
        const deletedMenu = response.data?.deletedMainCategory;
    
        if (deletedMenu) {
          // Update the menus state by filtering out the deleted menu
          setMenus((prevMenus) =>
          prevMenus.filter((m) => m._id !== deletedMenu._id)
          );

         console.log("Component re-rendered");
    
          // Optionally close the delete modal if needed
          setIsDeleteConfirmationModalOpen(false);
        }
      } catch (error) {
        console.error("Error deleting main category:", error);
      }
    };
    
    

  const [editedMenu, setEditedMenu] = useState({
    name: "",
    // Add other fields here
  });

  const handleEdit = (menu) => {
    setEditedMenu(menu);
    setIsEditModalOpen(true);
    setIsEditModalOpen(true);
  };
  const menusPerPage = 10; // Change this to set the number of menus per page

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("name", editedMenu.name);
  
      if (editedMenuImage) {
        formData.append("mainImage", editedMenuImage);
      }
  
      const response = await axios.patch(
        `http://localhost:5000/api/main/${editedMenu._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      const updatedMainCategory = response.data;
  
      // Update both menus and searchResults
      setMenus((prevMenus) =>
        prevMenus.map((menu) =>
          menu._id === updatedMainCategory._id ? updatedMainCategory : menu
        )
      );
  
      setSearchResults((prevSearchResults) =>
        prevSearchResults.map((menu) =>
          menu._id === updatedMainCategory._id ? updatedMainCategory : menu
        )
      );
  
      setIsEditModalOpen(false);
  
      // Fetch the updated list of menus
      const updatedMenusResponse = await axios.get("http://localhost:5000/api/main");
      setMenus(updatedMenusResponse.data);
    } catch (error) {
      console.error("Error updating main category:", error);
    }
  };
  

  const handlePicturePreview = (mainImage) => {
    const completeImageUrl = `http://localhost:5000/${mainImage}`;
    setPreviewImageUrl(completeImageUrl);
    setIsPreviewModalOpen(true);
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/main");
        setMenus(response.data);

        // Update searchResults based on the search input
        const filteredMenus = response.data.filter((menu) =>
          menu.name.toLowerCase().startsWith(searchInput.toLowerCase())
        );
        setSearchResults(filteredMenus);
      } catch (error) {
        console.error("Error fetching menus:", error);
      }
    };
    fetchMenus();
  },[menus], [searchInput]);

  const pageCount = Math.ceil(menus.length / menusPerPage);

  // const changePage = ({ selected }) => {
  //     setPageNumber(selected);
  // };

  const displayMenus = searchResults
    .slice(pageNumber * menusPerPage, (pageNumber + 1) * menusPerPage)
    .map((menu, index) => (
      <tr key={menu._id} className="hover:bg-gray-100">
        <td className="p-1 border text-center text-gray">
          {pageNumber * menusPerPage + index + 1}
        </td>
        <td className="pl-4 border text-left text-gray">{menu.name}</td>
        {/* <td className="p-2 border-b text-center justify-center">
                    {menu.mainImage ? (
                        <button
                            type="button"
                            className="bg-red-400 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded-lg text-sm"
                            onClick={() => handlePicturePreview(menu.mainImage)}
                        >
                            Preview
                        </button>
                    ) : (
                        "Not Added"
                    )}
                </td> */}
        <td className="border py-1 text-center">
          {/* <button
                        className="text-white mr-3 hover:bg-green-600 focus:outline-none font-sans font-medium border p-1 bg-blue-600 rounded-md px-4 text-sm"
                        onClick={() => handleViewMainCategory(menu)}
                    >
                        <FontAwesomeIcon icon={faEye} className="cursor-pointer" /> View
                    </button> */}

          <button
            className="text-gray mr-3 hover:bg-gray-300 focus:outline-none font-sans font-medium border border-gray-400 p-1 rounded-full px-4 text-sm  b"
            onClick={() => handleEdit(menu)}
          >
            <FontAwesomeIcon
              icon={faPenToSquare}
              color="orange"
              className="cursor-pointer"
            />{" "}
            Edit
          </button>
          <button
            className="text-gray  mr-3 hover:bg-gray-300 font-sans focus:outline-none font-medium border border-gray-400 p-1  rounded-full px-4 text-sm"
            onClick={() => handleDelete(menu)}
          >
            <FontAwesomeIcon
              icon={faTrash}
              color="red"
              className="cursor-pointer"
            />{" "}
            Delete
          </button>
        </td>
      </tr>
    ));

  const home = () => {
    router.push("/dashboard");
  };

  return (
    <>
      <Navbar />

      <Square />

      <div className="container mx-auto p-2 w-full overflow-x-auto border-gray-300 border-2 shadow-md ">
        <div className="flex items-center justify-between  mt-2">
          <h1 className="text-md font-semibold font-sans">
           Main Menu Category
          </h1>
          <div className="flex justify-center">
            <div className="relative mx-auto text-gray-600 justify-center flex float-right">
              <input
                className="border-2 mr-2 border-gray-300  bg-white h-9  rounded-2xl pl-3 text-sm focus:outline-none"
                id="searchInput"
                type="text"
                name="searchInput"
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                autoComplete="off"

              />

              <button
                type="submit"
                className="absolute right-0 top-0 mr-2"
              >
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-700 mr-3 mt-2"
                />
              </button>
            </div>

            <div className="flex justify-end mr-2">
              <button
                className=" border border-gray-600 hover:bg-gray-300 text-gray font-bold py-2 px-2 rounded-full text-sm"
                onClick={() => setIsNewModalOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="" />
                Add
              </button>
            </div>
          </div>
        </div>

        <table className="min-w-full border border-gray-300  mt-3">
          <thead className="text-sm bg-gray-300 text-gray-700">
            <tr>
              <th className="p-1 border">Sr No.</th>
              <th className="p-1 border">Name</th>
              {/* <th className="p-2 border text-center">Image</th> */}
              <th className="p-1 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-md font-sans font-bold">{displayMenus}</tbody>
        </table>

        <div className="flex flex-col items-center mt-2">
          <span className="text-xs text-gray-700 dark:text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {pageNumber * menusPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.min((pageNumber + 1) * menusPerPage, menus.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {menus.length}
            </span>{" "}
            Menus
          </span>
          <div className="inline-flex xs:mt-0 mt-2">
            <button
              className=" flex items-center justify-center px-3 h-8 text-xs font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 0))}
            >
              <FontAwesomeIcon icon={faAnglesLeft} />
            </button>
            <button
              className="flex items-center justify-center px-3 h-8 text-xs font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
              onClick={() =>
                setPageNumber((prev) => Math.min(prev + 1, pageCount - 1))
              }
            >
              <FontAwesomeIcon icon={faAnglesRight} />
            </button>
          </div>
        </div>
      </div>

      {isPreviewModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-container bg-white w-72 p-6 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setIsPreviewModalOpen(false)}
            ></button>
            <div className="p-1 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                Image Preview
              </h3>
              <Image
                src={completeImageUrl}
                alt="Preview"
                width={500}
                height={500}
              />
              <button
                type="button"
                className="border border-gray-400 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded-full mt-4 mr-2"
                onClick={() => setIsPreviewModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-container bg-white  w-full md:w-96 p-6 m-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setIsEditModalOpen(false)}
            ></button>
            <div className="p-1 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                Edit Menu
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="editMenuName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="editMenuName"
                  name="editMenuName"
                  value={editedMenu.name}
                  onChange={(e) =>
                    setEditedMenu({ ...editedMenu, name: e.target.value })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="editMenuImage"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Image
                </label>
                <input
                  type="file"
                  id="editMenuImage"
                  name="editMenuImage"
                  accept="image/*"
                  onChange={(e) => setEditedMenuImage(e.target.files[0])}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="button"
                className="border border-gray-400 hover:bg-gray-300 text-gray font-bold py-2 px-4 rounded-full mr-2"
                onClick={handleEditSubmit}
              >
                Save
              </button>
              <button
                type="button"
                className="border border-gray-400 hover:bg-gray-300 text-gray font-bold py-2 px-4 rounded-full"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isNewModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-container bg-white  w-full md:w-96 p-6 m-4 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setIsNewModalOpen(false)}
            ></button>
            <div className="p-1 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                Add New Menu
              </h3>

              <div className="mb-4">
                <label
                  htmlFor="newMenuName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="newMenuName"
                  name="newMenuName"
                  value={newMenu.name}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, name: e.target.value })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="newMenuImage"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  Image
                </label>
                <input
                  type="file"
                  id="newMenuImage"
                  name="newMenuImage"
                  accept="image/*"
                  onChange={(e) => setNewMenuImage(e.target.files[0])}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="button"
                className="border border-gray-400 hover:bg-gray-300 text-gray font-bold py-2 px-4 rounded-full mr-2"
                onClick={handleAddSubmit}
              >
                Add
              </button>
              <button
                type="button"
                className="border border-gray-400 hover:bg-gray-300 text-gray font-bold py-2 px-4 rounded-full"
                onClick={() => setIsNewModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmationModalOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
  >
    <div
      className="modal-container bg-white w-full md:w-96 p-6 m-4 rounded shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
        onClick={() => setIsDeleteConfirmationModalOpen(false)}
      ></button>
      <div className="p-1 text-center">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
          Delete Menu
        </h3>
        <p className="mb-5 text-sm text-gray-700 dark:text-gray-400">
          Are you sure you want to delete the menu{" "}
          <strong>{editedMenu.name}</strong>?
        </p>
        <button
          type="button"
          className="border border-gray-400 hover:bg-red-300 text-gray font-bold py-2 px-4 rounded-full mr-2"
          onClick={() => handleDeleteConfirmed(editedMenu)}
        >
          Delete
        </button>
        <button
          type="button"
          className="border border-gray-400 hover:bg-gray-300 text-gray font-bold py-2 px-4 rounded-full"
          onClick={() => setIsDeleteConfirmationModalOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


      {isViewMainCategoryModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="modal-container bg-white w-96 p-6 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setIsViewMainCategoryModalOpen(false)}
            ></button>
            <div className="p-1 text-center">
              <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-gray-400">
                View Main Category
              </h3>
              <div className="p-1 text-center">
                <p>Name: {mainCategoryToView?.name}</p>
                {/* Add other fields as needed */}
                <p>
                  Image:
                  {mainCategoryToView?.mainImage ? (
                    <img
                      src={`http://localhost:5000/${mainCategoryToView.mainImage}`}
                      alt="Main Category"
                      className="max-w-full max-h-32 mt-2"
                    />
                  ) : (
                    "Not Available"
                  )}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md mt-4"
                  onClick={() => setIsViewMainCategoryModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MainMenuList;





