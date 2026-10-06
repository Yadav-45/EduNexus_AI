import React, { useMemo, useState } from "react";
import "./InventoryDashboard.css";

function InventoryDashboard() {
  const [activeSection, setActiveSection] = useState("Overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // ---------------------------------------------------------
  // FRONTEND DEMO DATA
  // ---------------------------------------------------------

  const [items] = useState([
    {
      id: 1,
      itemName: "A4 Printing Paper",
      category: "Stationery",
      unit: "Ream",
      quantity: 45,
      minStock: 20,
      maxStock: 100,
      unitCost: 320,
      supplier: "ABC Stationers",
      status: "ACTIVE",
    },
    {
      id: 2,
      itemName: "Blue Ball Pen",
      category: "Stationery",
      unit: "Box",
      quantity: 8,
      minStock: 15,
      maxStock: 50,
      unitCost: 180,
      supplier: "ABC Stationers",
      status: "ACTIVE",
    },
    {
      id: 3,
      itemName: "School Desk",
      category: "Furniture",
      unit: "Piece",
      quantity: 75,
      minStock: 20,
      maxStock: 150,
      unitCost: 2800,
      supplier: "Modern Furniture",
      status: "ACTIVE",
    },
    {
      id: 4,
      itemName: "Whiteboard Marker",
      category: "Stationery",
      unit: "Box",
      quantity: 0,
      minStock: 10,
      maxStock: 40,
      unitCost: 250,
      supplier: "ABC Stationers",
      status: "ACTIVE",
    },
    {
      id: 5,
      itemName: "Projector",
      category: "Electronics",
      unit: "Piece",
      quantity: 6,
      minStock: 2,
      maxStock: 10,
      unitCost: 42000,
      supplier: "Tech Solutions",
      status: "ACTIVE",
    },
    {
      id: 6,
      itemName: "Sports Football",
      category: "Sports",
      unit: "Piece",
      quantity: 18,
      minStock: 5,
      maxStock: 30,
      unitCost: 850,
      supplier: "Sports World",
      status: "ACTIVE",
    },
  ]);

  // ---------------------------------------------------------
  // CALCULATIONS
  // ---------------------------------------------------------

  const totalItems = items.length;

  const activeItems = items.filter(
    (item) => item.status === "ACTIVE"
  ).length;

  const inactiveItems = items.filter(
    (item) => item.status === "INACTIVE"
  ).length;

  const lowStockItems = items.filter(
    (item) =>
      item.quantity > 0 &&
      item.quantity <= item.minStock
  ).length;

  const outOfStockItems = items.filter(
    (item) => item.quantity === 0
  ).length;

  const inventoryValue = items.reduce(
    (total, item) =>
      total + item.quantity * item.unitCost,
    0
  );

  const categories = [
    ...new Set(items.map((item) => item.category)),
  ];

  // ---------------------------------------------------------
  // FILTER ITEMS
  // ---------------------------------------------------------

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.itemName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.supplier
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All Categories" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    items,
    searchTerm,
    categoryFilter,
    statusFilter,
  ]);

  // ---------------------------------------------------------
  // STOCK STATUS
  // ---------------------------------------------------------

  const getStockStatus = (item) => {
    if (item.quantity === 0) {
      return {
        label: "Out of Stock",
        className: "stock-danger",
      };
    }

    if (item.quantity <= item.minStock) {
      return {
        label: "Low Stock",
        className: "stock-warning",
      };
    }

    return {
      label: "In Stock",
      className: "stock-success",
    };
  };

  // ---------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------

  const menuItems = [
    "Overview",
    "Items",
    "Categories",
    "Suppliers",
    "Stock Movements",
    "Reconciliation",
  ];

  const operations = [
    {
      name: "Items",
      icon: "📦",
      description:
        "View and manage all school inventory items.",
    },
    {
      name: "Categories",
      icon: "🗂️",
      description:
        "Organize inventory into useful categories.",
    },
    {
      name: "Suppliers",
      icon: "🚚",
      description:
        "Manage vendors and supplier information.",
    },
    {
      name: "Stock Movements",
      icon: "🔄",
      description:
        "Track stock-in, stock-out and adjustments.",
    },
    {
      name: "Reconciliation",
      icon: "🧾",
      description:
        "Compare inventory transactions with accounting.",
    },
  ];

  // ---------------------------------------------------------
  // ITEMS SECTION
  // ---------------------------------------------------------

  const renderItems = () => {
    return (
      <div className="inventory-content-card">

        <div className="content-header">
          <div>
            <h2>Inventory Items</h2>
            <p>
              Manage all school inventory items, stock levels
              and suppliers.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              alert("Add Item form will be connected next.")
            }
          >
            + Add Item
          </button>
        </div>

        {/* ITEM SUMMARY */}

        <div className="item-summary-grid">

          <div className="item-summary-card">
            <span>Total Items</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="item-summary-card">
            <span>Active Items</span>
            <strong>{activeItems}</strong>
          </div>

          <div className="item-summary-card warning-summary">
            <span>Low Stock</span>
            <strong>{lowStockItems}</strong>
          </div>

          <div className="item-summary-card danger-summary">
            <span>Out of Stock</span>
            <strong>{outOfStockItems}</strong>
          </div>

        </div>

        {/* FILTERS */}

        <div className="inventory-filter-row">

          <div className="inventory-search-wrapper">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search item or supplier..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
            className="inventory-filter-select"
          >
            <option>All Categories</option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="inventory-filter-select"
          >
            <option>All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DISCONTINUED">
              Discontinued
            </option>
          </select>

        </div>

        {/* ITEMS TABLE */}

        <div className="inventory-table-wrapper">

          <table className="inventory-items-table">

            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Min / Max</th>
                <th>Unit Cost</th>
                <th>Supplier</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredItems.length === 0 ? (

                <tr>
                  <td colSpan="8">

                    <div className="table-empty">

                      <span>📦</span>

                      <strong>
                        No items found
                      </strong>

                      <p>
                        Try changing your search or
                        filter options.
                      </p>

                    </div>

                  </td>
                </tr>

              ) : (

                filteredItems.map((item) => {

                  const stockStatus =
                    getStockStatus(item);

                  return (
                    <tr key={item.id}>

                      {/* ITEM */}

                      <td>

                        <div className="item-name-cell">

                          <div className="item-avatar">
                            📦
                          </div>

                          <div>
                            <strong>
                              {item.itemName}
                            </strong>

                            <small>
                              ID: INV-
                              {String(item.id).padStart(
                                4,
                                "0"
                              )}
                            </small>
                          </div>

                        </div>

                      </td>

                      {/* CATEGORY */}

                      <td>
                        <span className="category-badge">
                          {item.category}
                        </span>
                      </td>

                      {/* STOCK */}

                      <td>

                        <div className="quantity-cell">

                          <strong>
                            {item.quantity}
                          </strong>

                          <span>
                            {item.unit}
                          </span>

                        </div>

                      </td>

                      {/* MIN MAX */}

                      <td>

                        <span className="min-max-stock">
                          {item.minStock} /{" "}
                          {item.maxStock}
                        </span>

                      </td>

                      {/* UNIT COST */}

                      <td>
                        ₹
                        {item.unitCost.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      {/* SUPPLIER */}

                      <td>
                        <span className="supplier-name">
                          {item.supplier}
                        </span>
                      </td>

                      {/* STOCK STATUS */}

                      <td>

                        <span
                          className={`stock-status ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="item-actions">

                          <button
                            title="View"
                            onClick={() =>
                              alert(
                                `Viewing ${item.itemName}`
                              )
                            }
                          >
                            👁️
                          </button>

                          <button
                            title="Edit"
                            onClick={() =>
                              alert(
                                `Editing ${item.itemName}`
                              )
                            }
                          >
                            ✏️
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

        {/* TABLE FOOTER */}

        <div className="items-table-footer">

          <span>
            Showing{" "}
            <strong>
              {filteredItems.length}
            </strong>{" "}
            of{" "}
            <strong>{totalItems}</strong> items
          </span>

          <span>
            Inventory Value:{" "}
            <strong>
              ₹
              {inventoryValue.toLocaleString(
                "en-IN"
              )}
            </strong>
          </span>

        </div>

      </div>
    );
  };

  // ---------------------------------------------------------
  // OVERVIEW SECTION
  // ---------------------------------------------------------

  const renderOverview = () => {
    return (
      <>
        {/* STAT CARDS */}

        <div className="inventory-stats">

          <div className="inventory-stat-card">

            <div className="stat-icon">
              📦
            </div>

            <div className="stat-content">
              <span>Total Items</span>
              <strong>{totalItems}</strong>
              <small>
                Inventory items
              </small>
            </div>

          </div>

          <div className="inventory-stat-card">

            <div className="stat-icon">
              💰
            </div>

            <div className="stat-content">
              <span>Inventory Value</span>

              <strong>
                ₹
                {inventoryValue.toLocaleString(
                  "en-IN"
                )}
              </strong>

              <small>
                Current stock value
              </small>
            </div>

          </div>

          <div className="inventory-stat-card warning">

            <div className="stat-icon">
              ⚠️
            </div>

            <div className="stat-content">
              <span>Low Stock</span>
              <strong>{lowStockItems}</strong>
              <small>
                Items need attention
              </small>
            </div>

          </div>

          <div className="inventory-stat-card danger">

            <div className="stat-icon">
              🚨
            </div>

            <div className="stat-content">
              <span>Out of Stock</span>
              <strong>{outOfStockItems}</strong>
              <small>
                Items unavailable
              </small>
            </div>

          </div>

        </div>

        {/* OPERATIONS */}

        <div className="inventory-content-card">

          <div className="section-header">

            <div>
              <h2>
                Inventory Operations
              </h2>

              <p>
                Manage every part of your
                school's inventory system.
              </p>
            </div>

          </div>

          <div className="operation-grid">

            {operations.map((operation) => (

              <div
                className="operation-card"
                key={operation.name}
                onClick={() =>
                  setActiveSection(
                    operation.name
                  )
                }
              >

                <div className="operation-icon">
                  {operation.icon}
                </div>

                <h3>
                  {operation.name}
                </h3>

                <p>
                  {operation.description}
                </p>

                <button>
                  Open {operation.name} →
                </button>

              </div>

            ))}

          </div>

        </div>

        {/* RECENT MOVEMENTS */}

        <div className="inventory-content-card">

          <div className="section-header">

            <div>
              <h2>
                Recent Stock Movements
              </h2>

              <p>
                Your latest inventory activity
                will appear here.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                setActiveSection(
                  "Stock Movements"
                )
              }
            >
              View All
            </button>

          </div>

          <div className="inventory-table-wrapper">

            <table className="inventory-table">

              <thead>

                <tr>
                  <th>Movement</th>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                <tr>

                  <td colSpan="6">

                    <div className="table-empty">

                      <span>📦</span>

                      <strong>
                        No inventory movements yet
                      </strong>

                      <p>
                        Stock transactions will
                        appear here once inventory
                        activity begins.
                      </p>

                    </div>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>
      </>
    );
  };

  // ---------------------------------------------------------
  // CATEGORIES
  // ---------------------------------------------------------

  const renderCategories = () => {
    return (
      <div className="inventory-content-card">

        <div className="content-header">

          <div>
            <h2>
              Inventory Categories
            </h2>

            <p>
              Organize your school inventory
              into useful categories.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              alert(
                "Category creation form will be connected next."
              )
            }
          >
            + Add Category
          </button>

        </div>

        <div className="category-grid">

          {categories.map((category, index) => {

            const categoryItems =
              items.filter(
                (item) =>
                  item.category === category
              );

            const categoryValue =
              categoryItems.reduce(
                (total, item) =>
                  total +
                  item.quantity *
                    item.unitCost,
                0
              );

            return (
              <div
                className="category-card"
                key={category}
              >

                <div className="category-card-icon">
                  {index === 0
                    ? "📝"
                    : index === 1
                    ? "🪑"
                    : index === 2
                    ? "💻"
                    : "⚽"}
                </div>

                <h3>
                  {category}
                </h3>

                <p>
                  {categoryItems.length} items
                </p>

                <strong>
                  ₹
                  {categoryValue.toLocaleString(
                    "en-IN"
                  )}
                </strong>

              </div>
            );
          })}

        </div>

      </div>
    );
  };

  // ---------------------------------------------------------
  // SUPPLIERS
  // ---------------------------------------------------------

  const renderSuppliers = () => {

    const suppliers = [
      ...new Set(
        items.map(
          (item) => item.supplier
        )
      ),
    ];

    return (
      <div className="inventory-content-card">

        <div className="content-header">

          <div>
            <h2>
              Inventory Suppliers
            </h2>

            <p>
              Manage vendors supplying school
              inventory.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              alert(
                "Supplier creation form will be connected next."
              )
            }
          >
            + Add Supplier
          </button>

        </div>

        <div className="supplier-grid">

          {suppliers.map((supplier) => {

            const supplierItems =
              items.filter(
                (item) =>
                  item.supplier ===
                  supplier
              );

            return (
              <div
                className="supplier-card"
                key={supplier}
              >

                <div className="supplier-icon">
                  🚚
                </div>

                <div>
                  <h3>
                    {supplier}
                  </h3>

                  <p>
                    {supplierItems.length} inventory
                    items
                  </p>
                </div>

                <button>
                  View →
                </button>

              </div>
            );
          })}

        </div>

      </div>
    );
  };

  // ---------------------------------------------------------
  // STOCK MOVEMENTS
  // ---------------------------------------------------------

  const renderMovements = () => {
    return (
      <div className="inventory-content-card">

        <div className="content-header">

          <div>
            <h2>
              Stock Movements
            </h2>

            <p>
              Track stock-in, stock-out, issues,
              returns and adjustments.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              alert(
                "Stock movement form will be connected next."
              )
            }
          >
            + Record Movement
          </button>

        </div>

        <div className="movement-summary">

          <div className="movement-box">
            <span>
              Stock In
            </span>

            <strong>
              ₹0
            </strong>
          </div>

          <div className="movement-box">
            <span>
              Stock Out
            </span>

            <strong>
              ₹0
            </strong>
          </div>

          <div className="movement-box">
            <span>
              Issues
            </span>

            <strong>
              0
            </strong>
          </div>

          <div className="movement-box">
            <span>
              Returns
            </span>

            <strong>
              0
            </strong>
          </div>

        </div>

        <div className="empty-state">

          <div className="empty-icon">
            🔄
          </div>

          <h3>
            No stock movements yet
          </h3>

          <p>
            Inventory transactions will appear
            here after stock activity begins.
          </p>

        </div>

      </div>
    );
  };

  // ---------------------------------------------------------
  // RECONCILIATION
  // ---------------------------------------------------------

  const renderReconciliation = () => {
    return (
      <div className="inventory-content-card">

        <div className="content-header">

          <div>
            <h2>
              Accounting Reconciliation
            </h2>

            <p>
              Compare inventory transactions
              with accounting records.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              alert(
                "Reconciliation will be connected to the backend next."
              )
            }
          >
            Run Reconciliation
          </button>

        </div>

        <div className="reconciliation-grid">

          <div className="reconciliation-card">
            <span>
              Inventory Value
            </span>

            <strong>
              ₹
              {inventoryValue.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <div className="reconciliation-card">
            <span>
              Accounting Value
            </span>

            <strong>
              ₹0
            </strong>
          </div>

          <div className="reconciliation-card">
            <span>
              Difference
            </span>

            <strong>
              ₹
              {inventoryValue.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

        </div>

        <div className="empty-state">

          <div className="empty-icon">
            🧾
          </div>

          <h3>
            Reconciliation not connected
          </h3>

          <p>
            Accounting reconciliation will
            become available when inventory
            transactions are connected to the
            backend.
          </p>

        </div>

      </div>
    );
  };

  // ---------------------------------------------------------
  // MAIN CONTENT SWITCH
  // ---------------------------------------------------------

  const renderContent = () => {

    switch (activeSection) {

      case "Items":
        return renderItems();

      case "Categories":
        return renderCategories();

      case "Suppliers":
        return renderSuppliers();

      case "Stock Movements":
        return renderMovements();

      case "Reconciliation":
        return renderReconciliation();

      default:
        return renderOverview();
    }
  };

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div className="inventory-page">

      {/* HEADER */}

      <div className="inventory-header">

        <div>

          <p className="inventory-eyebrow">
            EDUNEXUS AI
          </p>

          <h1>
            Inventory Management
          </h1>

          <p className="inventory-subtitle">
            Manage school supplies, stock,
            suppliers and inventory operations
            from one place.
          </p>

        </div>

        <button
          className="primary-button header-button"
          onClick={() =>
            setActiveSection("Items")
          }
        >
          + Add Item
        </button>

      </div>

      {/* NAVIGATION */}

      <div className="inventory-navigation">

        {menuItems.map((item) => (

          <button
            key={item}
            className={
              activeSection === item
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActiveSection(item)
            }
          >
            {item}
          </button>

        ))}

      </div>

      {/* CONTENT */}

      {renderContent()}

    </div>
  );
}

export default InventoryDashboard;
