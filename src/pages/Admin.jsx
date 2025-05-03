import React, { useState } from "react";
import "../styles/admin.css";
// Import icons
import {
  FiMenu, FiX, FiHome, FiShoppingBag, FiUsers, FiPackage,
  FiSettings, FiLogOut, FiChevronLeft, FiChevronRight,
  FiDollarSign, FiShoppingCart, FiAlertCircle, FiPlus, FiEdit,
  FiCalendar, FiEye, FiArrowRight, FiChevronDown
} from "react-icons/fi";
import logoImage from "../assets/lorislogo.png";
import AdminOrders from "../components/AdminOrders";
import UploadProducts from "../components/UploadProducts";

const Admin = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  // Toggle dropdown menu
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Handle navigation tab change
  const handleTabChange = (tab, subTab = "") => {
    setActiveTab(tab);
    setActiveSubTab(subTab);
    if (window.innerWidth < 992) {
      setMobileOpen(false);
    }
  };

  // Mock data for dashboard
  const dashboardData = {
    stats: [
      { id: 1, title: "Total Revenue", value: "KSh 125,430", icon: <FiDollarSign />, change: "+15%", trend: "up" },
      { id: 2, title: "Orders", value: "84", icon: <FiShoppingCart />, change: "+24%", trend: "up" },
      { id: 3, title: "Customers", value: "142", icon: <FiUsers />, change: "+8%", trend: "up" },
      { id: 4, title: "Products", value: "38", icon: <FiPackage />, change: "-5", trend: "down" }
    ],
    recentOrders: [
      { id: "ORD-1234", customer: "Jane Smith", date: "2023-05-02", total: "KSh 3,450", status: "Delivered" },
      { id: "ORD-1233", customer: "John Doe", date: "2023-05-02", total: "KSh 5,200", status: "Processing" },
      { id: "ORD-1232", customer: "Mary Johnson", date: "2023-05-01", total: "KSh 1,800", status: "Shipped" },
      { id: "ORD-1231", customer: "David Wilson", date: "2023-04-30", total: "KSh 6,700", status: "Pending" },
      { id: "ORD-1230", customer: "Sarah Brown", date: "2023-04-30", total: "KSh 2,100", status: "Delivered" }
    ],
    topProducts: [
      { id: 1, name: "Elegant Jasmine Perfume", sales: 28, revenue: "KSh 42,000" },
      { id: 2, name: "Midnight Rose Collection", sales: 23, revenue: "KSh 34,500" },
      { id: 3, name: "Ocean Breeze Cologne", sales: 19, revenue: "KSh 28,500" },
      { id: 4, name: "Vanilla Dream Set", sales: 15, revenue: "KSh 22,500" }
    ],
    alerts: [
      { id: 1, message: "5 products are low in stock", type: "warning" },
      { id: 2, message: "New customer registrations increased by 25%", type: "info" },
      { id: 3, message: "Server maintenance scheduled for tonight", type: "info" }
    ]
  };

  // Dashboard content
  const renderDashboard = () => {
    return (
      <div className="dashboard">
        {/* Stats Section */}
        <div className="stats-container">
          {dashboardData.stats.map(stat => (
            <div className="stat-card" key={stat.id}>
              <div className="stat-icon">{stat.icon}</div>
              <div className="stat-details">
                <h3>{stat.title}</h3>
                <p className="stat-value">{stat.value}</p>
                <p className={`stat-change ${stat.trend}`}>
                  <span>{stat.change}</span>
                  <span className="trend-indicator"></span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid">
          {/* Recent Orders */}
          <div className="dashboard-card orders-card">
            <div className="card-header">
              <h3>Recent Orders</h3>
              <button className="view-all-btn">
                View All <FiArrowRight size={14} />
              </button>
            </div>
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>{order.total}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products & Alerts */}
          <div className="dashboard-side">
            {/* Top Products */}
            <div className="dashboard-card products-card">
              <div className="card-header">
                <h3>Top Selling Products</h3>
                <button className="view-all-btn">
                  <FiEye size={14} />
                </button>
              </div>
              <ul className="top-products-list">
                {dashboardData.topProducts.map(product => (
                  <li key={product.id}>
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p>{product.sales} Sales</p>
                    </div>
                    <div className="product-revenue">{product.revenue}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alerts */}
            <div className="dashboard-card alerts-card">
              <div className="card-header">
                <h3>Alerts</h3>
              </div>
              <ul className="alerts-list">
                {dashboardData.alerts.map(alert => (
                  <li key={alert.id} className={`alert-item ${alert.type}`}>
                    <FiAlertCircle size={16} />
                    <span>{alert.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate content based on active tab and subtab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "orders":
        return <AdminOrders isAdmin={true} />;
      case "products":
        if (activeSubTab === "add") {
          return <UploadProducts />;
        } else if (activeSubTab === "update") {
          return <div>Update Products List</div>;
        }
        return <div>Products Overview</div>;
      case "customers":
        return <div>Customers content</div>;
      case "settings":
        return <div>Settings content</div>;
      default:
        return <div>Dashboard content</div>;
    }
  };

  return (
    <div className={`admin-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logoImage} alt="Loris Kenya" className="sidebar-logo" />
            <h1 className="logo">Admin Panel</h1>
          </div>

          {/* Mobile close button */}
          <button className="mobile-close-btn" onClick={toggleMobileMenu}>
            <FiX size={24} />
          </button>

          {/* Desktop collapse button */}
          <button className="collapse-btn" onClick={toggleSidebar}>
            {sidebarCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <ul>
            <li className={activeTab === "dashboard" ? "active" : ""}>
              <button onClick={() => handleTabChange("dashboard")}>
                <FiHome size={18} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={activeTab === "orders" ? "active" : ""}>
              <button onClick={() => handleTabChange("orders")}>
                <FiShoppingBag size={18} />
                <span>Orders</span>
              </button>
            </li>

            {/* Products with dropdown */}
            <li className={activeTab === "products" ? "active" : ""}>
              <button
                className={`dropdown-toggle ${openDropdown === "products" ? "open" : ""}`}
                onClick={() => toggleDropdown("products")}
              >
                <FiPackage size={18} />
                <span>Products</span>
                <FiChevronDown
                  size={16}
                  className="dropdown-icon"
                />
              </button>

              {/* Dropdown menu */}
              {openDropdown === "products" && (
                <ul className="dropdown-menu">
                  <li className={activeSubTab === "" ? "active-subtab" : ""}>
                    <button onClick={() => handleTabChange("products", "")}>
                      <span>All Products</span>
                    </button>
                  </li>
                  <li className={activeSubTab === "add" ? "active-subtab" : ""}>
                    <button onClick={() => handleTabChange("products", "add")}>
                      <FiPlus size={14} />
                      <span>Add Product</span>
                    </button>
                  </li>
                  <li className={activeSubTab === "update" ? "active-subtab" : ""}>
                    <button onClick={() => handleTabChange("products", "update")}>
                      <FiEdit size={14} />
                      <span>Update Products</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            <li className={activeTab === "customers" ? "active" : ""}>
              <button onClick={() => handleTabChange("customers")}>
                <FiUsers size={18} />
                <span>Customers</span>
              </button>
            </li>
            <li className={activeTab === "settings" ? "active" : ""}>
              <button onClick={() => handleTabChange("settings")}>
                <FiSettings size={18} />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn">
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        {/* Header with mobile menu button */}
        <header className="admin-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
              <FiMenu size={24} />
            </button>
            <h2>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              {activeSubTab &&
                <span className="subtitle"> &rsaquo; {
                  activeSubTab === "add" ? "Add New" :
                    activeSubTab === "update" ? "Update" : activeSubTab
                }</span>
              }
            </h2>
          </div>
          <div className="header-right">
            <button className="refresh-btn">
              <FiCalendar size={18} />
              <span>Today</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-page-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Admin;
