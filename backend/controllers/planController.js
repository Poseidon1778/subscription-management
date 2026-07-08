import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from "../models/planModel.js";

const VALID_PERIODS = ["daily", "weekly", "monthly", "yearly"];

export const listPlans = async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.json({ success: true, plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching plans" });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await getPlanById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching plan" });
  }
};

export const addPlan = async (req, res) => {
  try {
    const { planName, price, billingPeriod } = req.body;

    if (!planName || price === undefined || !billingPeriod) {
      return res.status(400).json({
        success: false,
        message: "planName, price and billingPeriod are required",
      });
    }

    if (!VALID_PERIODS.includes(billingPeriod)) {
      return res.status(400).json({
        success: false,
        message: `billingPeriod must be one of: ${VALID_PERIODS.join(", ")}`,
      });
    }

    const plan = await createPlan({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating plan" });
  }
};

export const editPlan = async (req, res) => {
  try {
    if (req.body.billingPeriod && !VALID_PERIODS.includes(req.body.billingPeriod)) {
      return res.status(400).json({
        success: false,
        message: `billingPeriod must be one of: ${VALID_PERIODS.join(", ")}`,
      });
    }
    const plan = await updatePlan(req.params.id, req.body);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, plan });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating plan" });
  }
};

export const removePlan = async (req, res) => {
  try {
    await deletePlan(req.params.id);
    res.json({ success: true, message: "Plan deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting plan" });
  }
};
