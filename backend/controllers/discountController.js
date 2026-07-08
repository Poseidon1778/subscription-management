import {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  attachProduct,
  attachSubscription,
  detachProduct,
  detachSubscription,
} from "../models/discountModel.js";

const VALID_TYPES = ["fixed", "percentage"];

export const listDiscounts = async (req, res) => {
  try {
    const discounts = await getAllDiscounts();
    res.json({ success: true, discounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching discounts" });
  }
};

export const getDiscount = async (req, res) => {
  try {
    const discount = await getDiscountById(req.params.id);
    if (!discount) return res.status(404).json({ success: false, message: "Discount not found" });
    res.json({ success: true, discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching discount" });
  }
};

// POST /api/discounts  -- Admin only, per doc rule
export const addDiscount = async (req, res) => {
  try {
    const { discountName, discountType, value } = req.body;

    if (!discountName || !discountType || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "discountName, discountType and value are required",
      });
    }
    if (!VALID_TYPES.includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: `discountType must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    const discount = await createDiscount(req.body, req.user.id);
    res.status(201).json({ success: true, discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating discount" });
  }
};

export const editDiscount = async (req, res) => {
  try {
    if (req.body.discountType && !VALID_TYPES.includes(req.body.discountType)) {
      return res.status(400).json({
        success: false,
        message: `discountType must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }
    const discount = await updateDiscount(req.params.id, req.body);
    if (!discount) return res.status(404).json({ success: false, message: "Discount not found" });
    res.json({ success: true, discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating discount" });
  }
};

export const removeDiscount = async (req, res) => {
  try {
    await deleteDiscount(req.params.id);
    res.json({ success: true, message: "Discount deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting discount" });
  }
};

export const linkProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });
    await attachProduct(req.params.id, productId);
    res.status(201).json({ success: true, message: "Product linked to discount" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error linking product" });
  }
};

export const unlinkProduct = async (req, res) => {
  try {
    await detachProduct(req.params.id, req.params.productId);
    res.json({ success: true, message: "Product unlinked from discount" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error unlinking product" });
  }
};

export const linkSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) return res.status(400).json({ success: false, message: "subscriptionId is required" });
    await attachSubscription(req.params.id, subscriptionId);
    res.status(201).json({ success: true, message: "Subscription linked to discount" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error linking subscription" });
  }
};

export const unlinkSubscription = async (req, res) => {
  try {
    await detachSubscription(req.params.id, req.params.subscriptionId);
    res.json({ success: true, message: "Subscription unlinked from discount" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error unlinking subscription" });
  }
};
