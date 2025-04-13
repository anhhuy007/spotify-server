import subscriptionController from "../controllers/subscription.controller.js";
import express from "express";

const router = express.Router();

router.post("/create", subscriptionController.createSubscription);
router.get("/check/:userId", subscriptionController.checkUserSubscription);
router.delete("/cancel/:userId", subscriptionController.cancelSubscription);
router.get("/:userId/all", subscriptionController.getAllUserSubscriptions);
router.get("/:userId", subscriptionController.getUserSubscription);

export default router;
