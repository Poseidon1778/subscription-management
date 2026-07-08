import {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  addSubscriptionLine,
  deleteSubscriptionLine,
  getSubscriptionStatus,
  isValidStatusTransition,
  updateSubscriptionStatus,
  updateSubscriptionDetails,
  deleteSubscription,
  STATUS_FLOW,
} from "../models/subscriptionModel.js";

export const listSubscriptions = async (req, res) => {
  try {
    const subscriptions = await getAllSubscriptions();
    res.json({ success: true, subscriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching subscriptions" });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const subscription = await getSubscriptionById(req.params.id);
    if (!subscription) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching subscription" });
  }
};

export const addSubscription = async (req, res) => {
  try {
    const { customerId, planId, startDate } = req.body;
    if (!customerId || !planId || !startDate) {
      return res.status(400).json({
        success: false,
        message: "customerId, planId and startDate are required",
      });
    }
    const subscription = await createSubscription({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error creating subscription" });
  }
};

export const editSubscription = async (req, res) => {
  try {
    const subscription = await updateSubscriptionDetails(req.params.id, req.body);
    if (!subscription) return res.status(404).json({ success: false, message: "Subscription not found" });
    res.json({ success: true, subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating subscription" });
  }
};

export const removeSubscription = async (req, res) => {
  try {
    await deleteSubscription(req.params.id);
    res.json({ success: true, message: "Subscription deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting subscription" });
  }
};

// PATCH /api/subscriptions/:id/status  { "status": "quotation" }
export const changeSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    if (!STATUS_FLOW.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${STATUS_FLOW.join(", ")}`,
      });
    }

    const currentStatus = await getSubscriptionStatus(id);
    if (!currentStatus) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (!isValidStatusTransition(currentStatus, newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from '${currentStatus}' to '${newStatus}'. Flow is: ${STATUS_FLOW.join(" → ")}`,
      });
    }

    const subscription = await updateSubscriptionStatus(id, newStatus);
    res.json({ success: true, subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

export const addLine = async (req, res) => {
  try {
    const { productId, quantity, unitPrice } = req.body;
    if (!productId || quantity === undefined || unitPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "productId, quantity and unitPrice are required",
      });
    }
    const line = await addSubscriptionLine(req.params.id, req.body);
    res.status(201).json({ success: true, line });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error adding line" });
  }
};

export const removeLine = async (req, res) => {
  try {
    await deleteSubscriptionLine(req.params.lineId);
    res.json({ success: true, message: "Line removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error removing line" });
  }
};
