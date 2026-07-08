import { getAllTaxes, getTaxById, createTax, updateTax, deleteTax } from "../models/taxModel.js";

export const listTaxes = async (req, res) => {
  try {
    const taxes = await getAllTaxes();
    res.json({ success: true, taxes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching taxes" });
  }
};

export const getTax = async (req, res) => {
  try {
    const tax = await getTaxById(req.params.id);
    if (!tax) return res.status(404).json({ success: false, message: "Tax not found" });
    res.json({ success: true, tax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching tax" });
  }
};

export const addTax = async (req, res) => {
  try {
    const { taxName, taxPercent } = req.body;
    if (!taxName || taxPercent === undefined) {
      return res.status(400).json({ success: false, message: "taxName and taxPercent are required" });
    }
    const tax = await createTax({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, tax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating tax" });
  }
};

export const editTax = async (req, res) => {
  try {
    const tax = await updateTax(req.params.id, req.body);
    if (!tax) return res.status(404).json({ success: false, message: "Tax not found" });
    res.json({ success: true, tax });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating tax" });
  }
};

export const removeTax = async (req, res) => {
  try {
    await deleteTax(req.params.id);
    res.json({ success: true, message: "Tax deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting tax" });
  }
};
