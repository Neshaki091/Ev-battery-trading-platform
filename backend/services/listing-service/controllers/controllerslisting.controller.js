const Listing = require("../models/modelslisting.model");

// Lấy tất cả danh sách
exports.getAllListings = async (req, res) => {
  try{
    const listings = await Listing.find();
    res.status(200).json(listings);
  } catch (err){
    res.status(500).json({ message: err.message});
  }
};
exports.getListingById = async(req,res) => {
  try{
    const listing = await Listing. findById(req.params.id);
    if(!listing) return res.status(404).json({ message: 'Listing not found'});
    res.json(listing);
  } catch (err){
    res.status(500).json({ message: err.message });
  }
};
// 🟢 Tạo tin đăng mới
exports.createListing = async (req, res) => {
  try {
    const listing = new Listing(req.body);
    const savedListing = await listing.save();
    res.status(201).json({
      message: "Listing created successfully",
      data: savedListing,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🟡 Sửa tin đăng theo ID
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedListing = await Listing.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json({
      message: "Listing updated successfully",
      data: updatedListing,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.deleteListing = async (req, res) => {
  try{
    const deleted = await Listing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Listing not found'});
    res.json({ message: "Listing deleted successfully"});
  } catch (err){
    res.status(500).json({ message: err.message});
  }
};