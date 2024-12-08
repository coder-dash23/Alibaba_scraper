"use client";
import React, { useState } from "react";

const ProductsPage = () => {
  const [productName, setProductName] = useState("Chest freezer");
  const [searchResult, setSearchResult] = useState([]);
  const [pageCount, setPageCount] = useState(10); // Default to 10 pages

  // Construct the URL dynamically based on product name and page number
  const getAlibabaURL = (page) => {
    return `https://www.alibaba.com/trade/search?keywords=${encodeURIComponent(
      productName
    )}&page=${page}&pricef=0&pricet=1000`;
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    // Set search result with URLs after form submission
    const urls = Array.from({ length: pageCount }, (_, index) =>
      getAlibabaURL(index + 1)
    );
    setSearchResult(urls);
  };

  // Function to open all URLs in new tabs
  const openAllUrls = () => {
    searchResult.forEach((url) => {
      window.open(url, "_blank");
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md"
            onClick={() => {
              window.location.href = "/"; // Redirects to the homepage
            }}
          >
            Go To Main Page
          </button>
          {searchResult.length > 0 && (
            <button
              onClick={() => {
                const urls = searchResult.join("\n");
                navigator.clipboard
                  .writeText(urls)
                  .then(() => {
                    alert("All URLs have been copied to the clipboard!");
                  })
                  .catch((err) => {
                    console.error("Failed to copy URLs: ", err);
                  });
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Copy All URLs
            </button>
          )}
        </div>

        <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
          Alibaba Product Search
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Search for a product"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Search
            </button>
          </div>
          <div className="flex items-center">
            <label
              htmlFor="pageCount"
              className="text-gray-700 font-medium mr-2"
            >
              Number of Pages:
            </label>
            <input
              type="number"
              id="pageCount"
              value={pageCount}
              onChange={(e) => setPageCount(Number(e.target.value))}
              placeholder="Enter number of pages"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Display Paginated URLs */}
        <div className="mt-5">
          <ul className="space-y-3">
            {searchResult.length > 0 ? (
              searchResult.map((url, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 break-all">{url}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                  >
                    Open
                  </a>
                </li>
              ))
            ) : (
              <li>No results yet. Please search for a product.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
