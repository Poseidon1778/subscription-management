import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  addTemplateLine,
  deleteTemplateLine,
} from "../models/templateModel.js";

export const listTemplates = async (req, res) => {
  try {
    const templates = await getAllTemplates();
    res.json({ success: true, templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching templates" });
  }
};

export const getTemplate = async (req, res) => {
  try {
    const template = await getTemplateById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching template" });
  }
};

export const addTemplate = async (req, res) => {
  try {
    const { templateName } = req.body;
    if (!templateName) {
      return res.status(400).json({ success: false, message: "templateName is required" });
    }
    const template = await createTemplate({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating template" });
  }
};

export const editTemplate = async (req, res) => {
  try {
    const template = await updateTemplate(req.params.id, req.body);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating template" });
  }
};

export const removeTemplate = async (req, res) => {
  try {
    await deleteTemplate(req.params.id);
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting template" });
  }
};

export const addLine = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }
    const line = await addTemplateLine(req.params.id, req.body);
    res.status(201).json({ success: true, line });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding line" });
  }
};

export const removeLine = async (req, res) => {
  try {
    await deleteTemplateLine(req.params.lineId);
    res.json({ success: true, message: "Line removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error removing line" });
  }
};
