const mongoose = require('mongoose');
const Transaction = require('../models/schemas/Transaction');

const castObjectId = (idString) => {
  if (!idString) return null;
  try {
    return new mongoose.Types.ObjectId(idString);
  } catch (err) {
    console.warn(`Invalid ObjectId: ${idString}`);
  }
};

Transaction.createNew = async (userId, sellerId, listingId, price, type) => {
  const castUserId = castObjectId(userId);
  const castSellerId = castObjectId(sellerId);
  const castListingId = castObjectId(listingId);

  if (!castUserId || !castSellerId || !castListingId) {
    throw new Error('Invalid ObjectId for userId, sellerId, or listingId');
  }

  return await Transaction.create({
    userId: castUserId,
    sellerId: castSellerId,
    listingId: castListingId,
    price,
    type
  });
};


Transaction.findByIdPopulated = async (id) => {
  return await Transaction.findById(id).populate('userId sellerId listingId');
};

Transaction.updateById = async (id, updates) => {
  return await Transaction.findByIdAndUpdate(id, updates, { new: true });

Transaction.updateByIdPopulated = async (id, updates) => {
  return await Transaction.findByIdAndUpdate(id, updates, { new: true }).populate('userId sellerId listingId');  }
};

module.exports = Transaction;