import React, { useState } from "react";
import "../styles/orderTracking.css";

const OrderTracking = () => {
  const [activeTab, setActiveTab] = useState("ongoing");

  const ongoingOrders = [
    { id: "ORD123", item: "Elegant Perfume", status: "Processing" },
    { id: "ORD124", item: "Room Spray", status: "In Transit" },
  ];

  const deliveredOrders = [
    { id: "ORD101", item: "Niche Candle", deliveredOn: "April 20, 2025" },
    { id: "ORD102", item: "Auto Perfume", deliveredOn: "April 16, 2025" },
  ];

  return (
    <div className="tracking-wrapper">
      <div className="tabs">
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

      <div className="orders">
        {activeTab === "ongoing" &&
          ongoingOrders.map((order) => (
            <div key={order.id} className="order-card">
              <h4>{order.item}</h4>
              <p>Order ID: {order.id}</p>
              <p>Status: {order.status}</p>
            </div>
          ))}

        {activeTab === "delivered" &&
          deliveredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <h4>{order.item}</h4>
              <p>Order ID: {order.id}</p>
              <p>Delivered On: {order.deliveredOn}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OrderTracking;

