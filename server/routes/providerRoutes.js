const express = require("express");
const router = express.Router();

const {
  registerProvider,
  getProviders,
  getProviderById,
  updateProvider,
  deactivateProvider,
} = require("../controllers/providerController");

router.post("/register", registerProvider);

router.get("/", getProviders);

router.get("/:id", getProviderById);

router.patch("/:id", updateProvider);

router.delete("/:id", deactivateProvider);

module.exports = router;