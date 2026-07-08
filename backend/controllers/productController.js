import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  deleteVariant,
} from "../models/productModel.js";

export const listProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { productName, productType, salesPrice, costPrice } = req.body;
    if (!productName) {
      return res.status(400).json({ success: false, message: "productName is required" });
    }
    const product = await createProduct({
      productName, productType, salesPrice, costPrice, createdBy: req.user.id,
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
};

export const editProduct = async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
};

export const removeProduct = async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

export const addProductVariant = async (req, res) => {
  try {
    const { attribute, value, extraPrice } = req.body;
    if (!attribute || !value) {
      return res.status(400).json({ success: false, message: "attribute and value are required" });
    }
    const variant = await addVariant(req.params.id, { attribute, value, extraPrice });
    res.status(201).json({ success: true, variant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding variant" });
  }
};

export const removeProductVariant = async (req, res) => {
  try {
    await deleteVariant(req.params.variantId);
    res.json({ success: true, message: "Variant deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting variant" });
  }
};
