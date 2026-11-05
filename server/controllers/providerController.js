const Provider = require("../models/Provider");
// Register a provider
exports.registerProvider = async (req, res) => {
  try {
    const {
      name,
      phone,
      service,
      city,
      area,
      experience,
      description,
    } = req.body;

    if (!name || !phone || !service || !city || !area) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const provider = await Provider.create({
      name,
      phone,
      service,
      city,
      area,
      experience,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Provider registered successfully",
      provider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get providers with optional filters
exports.getProviders = async (req, res) => {
  try {
    const { city, service, area } = req.query;

    const filter = { isActive: true };

    if (city) {
      filter.city = { $regex: city, $options: "i" };
    }

    if (service) {
      filter.service = { $regex: service, $options: "i" };
    }

    if (area) {
      filter.area = { $regex: area, $options: "i" };
    }

    const providers = await Provider.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get one provider
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);

    if (!provider || !provider.isActive) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.status(200).json({
      success: true,
      provider,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid provider ID",
    });
  }
};

// Update provider profile
exports.updateProvider = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "service",
      "city",
      "area",
      "experience",
      "description",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided",
      });
    }

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider updated successfully",
      provider,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Deactivate provider (soft delete)
exports.deactivateProvider = async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: "Provider not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Provider deactivated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid provider ID",
    });
  }
};