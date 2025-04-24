import React, { useState } from "react";
import "../styles/adminOrder.css";

const AdminOrders = () => {
  const [activeTab, setActiveTab] = useState("ongoing");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [ongoingOrders, setOngoingOrders] = useState([
    {
      id: "A001",
      username: "Mary Njeri",
      email: "mary@example.com",
      phone: "+254712345678",
      address: "Rose Ave, Nairobi",
      items: "1x Elegant Perfume, 2x Room Sprays",
      total: "KSh 4,500",
      createdAt: "2025-04-22T10:30:00Z",
    },
    {
      id: "A002",
      username: "John Kimani",
      email: "john@example.com",
      phone: "+254798112233",
      address: "Thika Road, Nairobi",
      items: "1x Niche Candle",
      total: "KSh 2,300",
      createdAt: "2025-04-21T14:00:00Z",
    },
    // ...more orders
  ]);

  const [deliveredOrders, setDeliveredOrders] = useState([
    {
      id: "A100",
      username: "Grace Wambui",
      email: "grace@example.com",
      phone: "+254720334455",
      address: "Kasarani, Nairobi",
      items: "1x Auto Perfume, 1x Room Spray",
      total: "KSh 3,700",
      createdAt: "2025-04-19T12:15:00Z",
    },
    {
      id: "A101",
      username: "Brian Otieno",
      email: "brian@example.com",
      phone: "+254711112222",
      address: "Mombasa Road, Nairobi",
      items: "2x Diffusers",
      total: "KSh 5,000",
      createdAt: "2025-04-18T09:45:00Z",
    },
  ]);

  const handleSearch = (order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.username.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query)
    );
  };

  const markAsDelivered = (orderId) => {
    const order = ongoingOrders.find((o) => o.id === orderId);
    if (order) {
      setDeliveredOrders([...deliveredOrders, order]);
      setOngoingOrders(ongoingOrders.filter((o) => o.id !== orderId));
    }
  };

  const orders = (
    activeTab === "ongoing" ? ongoingOrders : deliveredOrders
  )
    .filter(handleSearch)
    .sort((a, b) => {
      return sortOrder === "newest"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    });

  const handleExport = () => {
    const data = orders
      .map(
        (order) =>
          `Order ID: ${order.id}\nCustomer: ${order.username}\nEmail: ${order.email}\nPhone: ${order.phone}\nAddress: ${order.address}\nItems: ${order.items}\nTotal: ${order.total}\nDate: ${new Date(order.createdAt).toLocaleString()}\n\n`
      )
      .join("");

    const blob = new Blob([data], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${activeTab}-orders.txt`;
    a.click();
  };

  return (
    <div className="admin-orders-wrapper">
      <div className="admin-tabs">
        <button
          className={activeTab === "ongoing" ? "tab active ongoing" : "tab"}
          onClick={() => setActiveTab("ongoing")}
        >
          Ongoing Orders
        </button>
        <button
          className={activeTab === "delivered" ? "tab active delivered" : "tab"}
          onClick={() => setActiveTab("delivered")}
        >
          Delivered Orders
        </button>
      </div>

      <div className="admin-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or order ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="sort-select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
        <button className="export-btn" onClick={handleExport}>
          Export Orders
        </button>
      </div>

      <div className="order-list">
        {orders.map((order) => (
          <div className="admin-order-card" key={order.id}>
            <h4>{order.username}</h4>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Email:</strong> <a href={`mailto:${order.email}`}>{order.email}</a></p>
            <p><strong>Phone:</strong> <a href={`tel:${order.phone}`}>{order.phone}</a></p>
            <p><strong>Address:</strong> {order.address}</p>
            <p><strong>Order Summary:</strong> {order.items}</p>
            <p><strong>Payment:</strong> {order.total}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>

            {activeTab === "ongoing" && (
              <button
                className="deliver-btn"
                onClick={() => markAsDelivered(order.id)}
              >
                Mark as Delivered
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;


