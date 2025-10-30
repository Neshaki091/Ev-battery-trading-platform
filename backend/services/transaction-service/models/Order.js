// In-memory storage (demo, thay bằng DB sau)
let orders = [];

// Class Order (có thể dùng ES6 class cho OOP)
class Order {
  constructor(userId, itemId, price, type) {
    this.id = Date.now(); // ID đơn giản từ timestamp
    this.userId = userId;
    this.itemId = itemId;
    this.price = price;
    this.type = type;
    this.status = 'pending';
    this.createdAt = new Date().toISOString();
  }
}

// Methods (static cho tiện)
Order.save = (order) => {
  orders.push(order);
};

Order.findById = (id) => {
  return orders.find(o => o.id === id);
};

Order.update = (updatedOrder) => {
  const index = orders.findIndex(o => o.id === updatedOrder.id);
  if (index !== -1) {
    orders[index] = updatedOrder;
  }
};

module.exports = Order;