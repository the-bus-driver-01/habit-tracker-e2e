export default function ProductsPage() {
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: "$99.99",
      category: "Electronics",
      stock: 45,
      status: "In Stock",
      image: "🎧",
    },
    {
      id: 2,
      name: "Smart Watch",
      price: "$199.99",
      category: "Wearables",
      stock: 23,
      status: "In Stock",
      image: "⌚",
    },
    {
      id: 3,
      name: "Laptop Stand",
      price: "$49.99",
      category: "Accessories",
      stock: 0,
      status: "Out of Stock",
      image: "💻",
    },
    {
      id: 4,
      name: "Bluetooth Speaker",
      price: "$79.99",
      category: "Electronics",
      stock: 67,
      status: "In Stock",
      image: "🔊",
    },
    {
      id: 5,
      name: "Wireless Mouse",
      price: "$29.99",
      category: "Accessories",
      stock: 12,
      status: "Low Stock",
      image: "🖱️",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your product inventory and catalog.
          </p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{product.image}</div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    product.status === "In Stock"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : product.status === "Low Stock"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {product.category}
              </p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {product.price}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200">
                  Edit
                </button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Product Summary
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {products.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Products
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {products.filter((p) => p.status === "In Stock").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                In Stock
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {products.filter((p) => p.status === "Out of Stock").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Out of Stock
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}