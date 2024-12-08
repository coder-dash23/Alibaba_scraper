"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProductScraper() {
  const [urls, setUrls] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");

  // Parse the URLs and handle empty input
  const urlArray = urls
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  // UseEffect for error handling
  useEffect(() => {
    if (urlArray.length === 0) {
      setError("Please enter at least one URL.");
      setIsLoading(false);
    } else {
      setError(null); // Clear error when URLs are valid
    }
  }, [urls]);

  const handleScrape = async () => {
    setError(null);
    setResponseData([]);
    setIsLoading(true);

    try {
      const { data } = await axios.post(
        "https://alibaba-scraper-backend.vercel.app/scrapeAlibabaSingle",
        {
          urls: urlArray,
        }
      );

      const queryDetails = data.map((item) => item.queryDetails[0]);

      if (queryDetails) {
        setResponseData(queryDetails);
      } else {
        setError("No data returned for the provided URLs.");
      }
    } catch (error) {
      setError("An error occurred while scraping.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sorting function
  const sortData = (order) => {
    const sortedData = [...responseData].sort((a, b) => {
      const priceA =
        a.prices && a.prices[0] ? parseFloat(a.prices[0].price) : 0;
      const priceB =
        b.prices && b.prices[0] ? parseFloat(b.prices[0].price) : 0;

      return order === "asc" ? priceA - priceB : priceB - priceA;
    });
    setResponseData(sortedData);
  };

  // Trigger sort whenever responseData or sortOrder changes
  useEffect(() => {
    if (responseData.length > 0) {
      sortData(sortOrder);
    }
  }, [sortOrder, responseData.length]); // Ensure effect only runs when necessary
  const downloadCSV = () => {
    const header = [
      "Product Name",
      "Product URL",
      "Prices (Price - Quantity Range)",
      "Images",
      "Supplier Name",
      "Supplier Location",
      "Years in Business",
      "Plug Type",
      "Warranty",
      "Type",
      "Function",
      "Application",
      "Place of Origin",
      "Power",
      "Voltage",
      "After Sales Service",
      "Power Source",
      "App Controlled",
      "Capacity",
      "Style",
      "Brand Name",
      "Model Number",
      "Non-Stick Material",
      "Shape",
      "Material",
      "Controlling Mode",
      "Operating Language",
      "Private Mold",
      "Temperature",
      "Item",
      "Keywords",
      "Color",
      "Multi-Function",
      "Usage",
      "Certification",
      "Packaging and Delivery (Selling Units)",
      "Single Package Size",
      "Single Gross Weight",
      "Sample Price",
    ];

    const rows = responseData.map((data) => [
      `"${data.product_name || "N/A"}"`,
      `"${data.product_url ? "https://" + data.product_url : "N/A"}"`,
      `"${
        data.prices
          ?.map((p) => `${p.price} - ${p.quantity_range}`)
          .join("; ") || "N/A"
      }"`,
      `"${data.images?.join("; ") || "N/A"}"`,
      `"${data.supplier_information?.name || "N/A"}"`,
      `"${data.supplier_information?.location || "N/A"}"`,
      `"${data.supplier_information?.years_in_business || "N/A"}"`,
      `"${data.product_attributes?.Plug_Type?.join("; ") || "N/A"}"`,
      `"${data.product_attributes?.warranty || "N/A"}"`,
      `"${data.product_attributes?.type || "N/A"}"`,
      `"${data.product_attributes?.function || "N/A"}"`,
      `"${data.product_attributes?.application || "N/A"}"`,
      `"${data.product_attributes?.place_of_origin || "N/A"}"`,
      `"${data.product_attributes?.power || "N/A"}"`,
      `"${data.product_attributes?.voltage || "N/A"}"`,
      `"${data.product_attributes?.after_sales_service || "N/A"}"`,
      `"${data.product_attributes?.power_source || "N/A"}"`,
      `"${data.product_attributes?.app_controlled || "N/A"}"`,
      `"${data.product_attributes?.capacity || "N/A"}"`,
      `"${data.product_attributes?.style || "N/A"}"`,
      `"${data.product_attributes?.brand_name || "N/A"}"`,
      `"${data.product_attributes?.model_number || "N/A"}"`,
      `"${data.product_attributes?.non_stick_material || "N/A"}"`,
      `"${data.product_attributes?.shape || "N/A"}"`,
      `"${data.product_attributes?.material || "N/A"}"`,
      `"${data.product_attributes?.controlling_mode || "N/A"}"`,
      `"${data.product_attributes?.operating_language || "N/A"}"`,
      `"${data.product_attributes?.private_mold || "N/A"}"`,
      `"${data.product_attributes?.temperature || "N/A"}"`,
      `"${data.product_attributes?.item || "N/A"}"`,
      `"${data.product_attributes?.keywords || "N/A"}"`,
      `"${data.product_attributes?.color || "N/A"}"`,
      `"${data.product_attributes?.multi_function || "N/A"}"`,
      `"${data.product_attributes?.usage || "N/A"}"`,
      `"${data.product_attributes?.certification || "N/A"}"`,
      `"${data.packaging_and_delivery?.selling_units || "N/A"}"`,
      `"${data.packaging_and_delivery?.single_package_size || "N/A"}"`,
      `"${data.packaging_and_delivery?.single_gross_weight || "N/A"}"`,
      `"${data.sample_price || "N/A"}"`,
    ]);

    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "scraped_data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Prevent closing modal when clicking outside or pressing "Esc"
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500 flex flex-col p-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full">
        <button
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md mb-3"
          onClick={() => {
            window.location.href = "/"; // Redirects to the homepage
          }}
        >
          Back to Main Page
        </button>
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          AliBaba Single Product Details Scraper (Multi URL Supported)
        </h2>

        <textarea
          rows={5}
          placeholder="Enter product URLs (one per line)"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none"
        />

        <button
          onClick={handleScrape}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md w-1/3 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <h2>Scraping</h2>
              <div className="w-5 h-5 mx-4 border-4 border-t-4 border-gray-200 border-t-purple-600 rounded-full animate-spin"></div>
            </>
          ) : (
            "Scrape"
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Conditionally render CSV and Sort */}
        {responseData.length > 0 && (
          <div className="flex justify-between mt-4">
            <button
              onClick={downloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md"
            >
              Download CSV
            </button>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="asc">Sort by Price (Low to High)</option>
              <option value="desc">Sort by Price (High to Low)</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-9">
          {responseData.length > 0
            ? responseData.map((data, index) => (
                <div
                  key={data.product_name || index} // Use a unique property for key
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 transform transition-all duration-300 ease-in-out hover:scale-105"
                >
                  {/* Product Name */}
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                    {data.product_name || "N/A"}
                  </h3>

                  {/* Product URL */}
                  {urlArray[index] && (
                    <p className="text-sm text-blue-500 mb-4">
                      <a
                        href={urlArray[index]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-white underline"
                      >
                        Click To View Product
                      </a>
                    </p>
                  )}
                  {/* Product Images */}
                  {data.images?.length > 0 ? (
                    <div className="flex space-x-2 overflow-x-auto mb-4">
                      {data.images.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt="Product"
                          className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
                          onClick={() => handleImageClick(image)} // Open modal on click
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No images available</p>
                  )}

                  {/* Prices */}
                  {data.prices?.length > 0 ? (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        Prices ($):
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300">
                        {data.prices.map((price, priceIndex) => (
                          <li key={priceIndex}>
                            <strong>Price:</strong> {price.price},{" "}
                            <strong>Quantity:</strong> {price.quantity_range}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No pricing information
                    </p>
                  )}

                  {/* Supplier Information */}
                  {data.supplier_information ? (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        Supplier Info:
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Name:</strong>{" "}
                        {data.supplier_information.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Location:</strong>{" "}
                        {data.supplier_information.location || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Years in Business:</strong>{" "}
                        {data.supplier_information.years_in_business || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No supplier information
                    </p>
                  )}

                  {/* Product Attributes */}
                  {data.product_attributes ? (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        Attributes:
                      </h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300">
                        {Object.entries(data.product_attributes).map(
                          ([key, value], attrIndex) => (
                            <li key={attrIndex}>
                              <span className="font-semibold">{key}:</span>{" "}
                              {value}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No product attributes
                    </p>
                  )}

                  {/*packaging_and_delivery*/}
                  {data.packaging_and_delivery ? (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        Packaging and delivery details:
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Selling_Units:</strong>{" "}
                        {data.packaging_and_delivery.selling_units || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Single_Package_Size:</strong>{" "}
                        {data.packaging_and_delivery.single_package_size ||
                          "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Single_Gross_Weight:</strong>{" "}
                        {data.packaging_and_delivery.single_gross_weight ||
                          "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Sample Price:</strong>{" "}
                        {data.sample_price || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No packaging_and_delivery
                    </p>
                  )}
                </div>
              ))
            : ""}
        </div>
      </div>

      {selectedImage && (
        <div className="fixed top-0 inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg relative w-[400px] h-[400px]">
            <button
              onClick={closeModal}
              className="absolute top-0 right-1 p-2 text-xl font-bold"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Selected Product"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
