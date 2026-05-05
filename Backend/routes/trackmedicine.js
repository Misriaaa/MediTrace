import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* ===========================
   TRACK MEDICINE
=========================== */

router.get("/", async (req, res) => {

  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "Medicine ID required"
      });
    }

    const product = await Product.findOne({
      medicineId: id
    });

    if (!product) {
      return res.status(404).json({
        message: "Medicine not found"
      });
    }

    res.json({
      success: true,
      medicineId: product.medicineId,
      name: product.medicineName,
      owner: product.owner,
      history: product.history
    });

  } catch (error) {

    console.error("Track Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

export default router;