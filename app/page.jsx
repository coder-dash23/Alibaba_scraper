"use client";
import React, { useState } from "react";
import axios from "axios";

export default function ProductScraper() {
  const [urls, setUrls] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");

  const handleScrape = async () => {
    setError(null);
    setResponseData([]);
    setIsLoading(true);

    try {
      const urlArray = urls
        .split("\n")
        .map((url) => url.trim())
        .filter(Boolean);
      if (urlArray.length === 0) {
        setError("Please enter at least one URL.");
        setIsLoading(false);
        return;
      }

      const { data } = await axios.post(
        "https://alibaba-scraper-backend.vercel.app/scrapeAlibabaSingle",
        {
          urls: urlArray,
        }
      );

      const flattenedProducts = data.flatMap((item) => item.products || []);
      if (flattenedProducts.length > 0) {
        setResponseData(flattenedProducts);
      } else {
        setError("No data returned for the provided URLs.");
      }
    } catch (error) {
      setError("Error fetching data. Please check the server and try again.");
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // Function to download the CSV
  const downloadCSV = () => {
    const header = [
      "Product Name",
      "Price Range",
      "Image",
      "Factory Name",
      "MOQ",
      "Product URL",
    ];
    const rows = responseData.map((data) => [
      `"${data.product_name || "N/A"}"`,
      `"${data.price_range || "N/A"}"`,
      `"${data.image || "N/A"}"`,
      `"${data.factory_name || "N/A"}"`,
      `"${data.minimum_order_quantity || "N/A"}"`,
      `"${data.product_url ? "https://" + data.product_url : "N/A"}"`, // Ensure product_url is a full URL
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

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    sortProducts(newSortOrder);
  };

  const sortProducts = (order) => {
    const sortedData = [...responseData].sort((a, b) => {
      const priceA = a.price_range
        ? parseFloat(a.price_range.toString().replace(/[^0-9.-]+/g, ""))
        : 0;
      const priceB = b.price_range
        ? parseFloat(b.price_range.toString().replace(/[^0-9.-]+/g, ""))
        : 0;

      return order === "asc" ? priceA - priceB : priceB - priceA;
    });

    setResponseData(sortedData);
  };

  const handleAllUrlCopy = () => {
    if (!responseData || responseData.length === 0) {
      setError("No URLs to copy.");
      return;
    }

    // Extract all URLs from the response data
    const allUrls = responseData
      .map((data) => (data.product_url ? `https://${data.product_url}` : null))
      .filter(Boolean)
      .join("\n"); // Join them into a single string with newlines

    // Copy the URLs to the clipboard
    navigator.clipboard
      .writeText(allUrls)
      .then(() => {
        alert("All URLs have been copied to the clipboard!");
      })
      .catch((err) => {
        setError("Failed to copy URLs to the clipboard.");
        console.error("Clipboard error:", err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500 flex flex-col p-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-full">
        <div className="flex justify-between items-center mb-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md mb-3"
            onClick={() => {
              window.location.href = "/Alibaba_All"; // Redirects to the homepage
            }}
          >
            Looking for a Single Product Details? Click Here! (Multi URL
            Supported)
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md mb-3"
            onClick={handleAllUrlCopy}
          >
            Click Here To Copy All URLs
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md mb-3"
            onClick={() => {
              window.location.href = "/Pagination"; // Redirects to the homepage
            }}
          >
            For Product Urls Click Here
          </button>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Alibaba Multi Product Data Scraper (Multi URL Supported)
        </h2>
        <textarea
          rows={5}
          placeholder="Enter AliBaba product URLs (one per line)"
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

        {responseData.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={downloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md"
            >
              Download CSV
            </button>

            <button
              onClick={toggleSortOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md mb-4"
            >
              Sort by Price ({sortOrder === "asc" ? "Descending" : "Ascending"})
            </button>
          </div>
        )}

        {responseData.length > 0 && (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-700 shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-600 text-gray-600 dark:text-gray-200 uppercase text-sm">
                  <tr>
                    <th className="py-4 px-6 text-left">Product Name</th>
                    <th className="py-4 px-6 text-left">Price Range</th>
                    <th className="py-4 px-6 text-left">Image</th>
                    <th className="py-4 px-6 text-left">Factory Name</th>
                    <th className="py-4 px-6 text-left">MOQ</th>
                    <th className="py-4 px-6 text-left">Product URL</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-200 text-sm font-semibold">
                  {responseData.map((data, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <td className="py-4 px-6 w-96">
                        {data.product_name || "N/A"}
                      </td>
                      <td className="py-4 px-6">{data.price_range || "N/A"}</td>
                      <td className="py-4 px-6">
                        <img
                          src={data.image}
                          alt="Product"
                          className="w-28 h-28 object-cover rounded-lg border"
                        />
                      </td>
                      <td className="py-4 px-6 w-64">
                        {data.factory_name || "N/A"}
                      </td>
                      <td className="py-4 px-6">
                        {data.minimum_order_quantity || "N/A"}
                      </td>
                      <td className="py-4 px-6">
                        <a
                          href={
                            data.product_url &&
                            !data.product_url.startsWith("http")
                              ? `https://${data.product_url}`
                              : data.product_url || "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          Click To View Product
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
