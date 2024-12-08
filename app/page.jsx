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
      const { data } = await axios.post("https://alibaba-backend.vercel.app/scrape", {
        urls: urlArray,
      });

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

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500 flex flex-col p-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-7 w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          AliBaba Product Details Scraper
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

        <div className="flex justify-end mt-5">
          {/* Sorting Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="asc">Sort by Price (Low to High)</option>
            <option value="desc">Sort by Price (High to Low)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mt-6">
          {responseData.length > 0 ? (
            responseData.map((data, index) => (
              <div
                key={data.product_name || index} // Use a unique property for key
                className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-3xl"
              >
                {/* Product Name */}
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  {data.product_name || "N/A"}
                </h3>

                {/* Product URL */}
                {urlArray.map((url, urlIndex) => (
                  <p key={urlIndex} className="text-sm text-blue-500 mb-4">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      View Product
                    </a>
                  </p>
                ))}

                {/* Product Images */}
                {data.images?.length > 0 ? (
                  <div className="flex space-x-2 overflow-x-auto mb-4">
                    {data.images.map((image, imgIndex) => (
                      <img
                        key={imgIndex}
                        src={image}
                        alt="Product"
                        className="w-20 h-20 object-cover rounded-lg border"
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
                      Prices:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300">
                      {data.prices.map((price, priceIndex) => (
                        <li key={priceIndex}>
                          {`Price: ${price.price}, Quantity: ${price.quantity_range}`}
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
                      {`Name: ${data.supplier_information.name || "N/A"}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {`Location: ${
                        data.supplier_information.location || "N/A"
                      }`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {`Years in Business: ${
                        data.supplier_information.years_in_business || "N/A"
                      }`}
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
                            {`${key}: ${value}`}
                          </li>
                          
                        )
                        
                      )}
                      Sample Price: {data.sample_price}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No product attributes
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No data to display</p>
          )}
        </div>
      </div>
    </div>
  );
}
