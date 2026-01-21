const { SalarySlab, Level, Role } = require("../models");
const { structureValidator } = require("../utils/structureValidator");

exports.addSalarySlab = async (req, res) => {
  try {
    const { roleId, levelId, fromAmount, toAmount, structure } = req.body;

    if (!roleId || !levelId || !fromAmount || !toAmount || !structure) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // const isValidStructure = structureValidator(structure, 100, true);
    // if (!isValidStructure) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid structure",
    //   });
    // }

    if (!structure.earnings || !structure.deductions) {
      return res.status(400).json({
        success: false,
        message: "Structure must include both earnings and deductions arrays",
      });
    }

    const slab = await SalarySlab.create({
      roleId,
      levelId,
      fromAmount,
      toAmount,
      structure,
    });

    res.status(201).json({
      success: true,
      message: "Salary Slab Added Successfully",
      data: slab,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({
      success: false,
      message: "Failed to create salary slab",
    });
  }
};

exports.getSalaryStructureList = async (req, res) => {
  try {
    const slabs = await SalarySlab.findAll({
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: Level,
          as: "level",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Salary Structure List Retrieved Successfully",
      data: slabs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve salary structure list",
    });
  }
};

exports.getSalaryStructureById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Role Id is required",
      });
    }

    const slabs = await SalarySlab.findAll({
      where: { id },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: Level,
          as: "level",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!slabs.length) {
      return res.status(404).json({
        success: false,
        message: "No salary structure found for the given role",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salary Structure List retrieved successfully!",
      data: slabs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve salary structure list",
    });
  }
};

exports.getSalaryStructureByRoleandLevel = async (req, res) => {
  try {
    const roleId = Number(req.query.roleId);
    const levelId = Number(req.query.levelId);

    // Validate both values
    if (!roleId || !levelId) {
      return res.status(400).json({
        success: false,
        message: "Role Id and Level Id are required and must be valid numbers",
      });
    }

    const slab = await SalarySlab.findOne({
      where: { roleId, levelId },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: Level,
          as: "level",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!slab) {
      return res.status(404).json({
        success: false,
        message: "No salary structure found for the given role and level",
      });
    }

    res.status(200).json({
      success: true,
      message: "Salary Structure retrieved successfully!",
      data: slab,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve salary structure",
    });
  }
};

exports.editSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId, levelId, fromAmount, toAmount, structure } = req.body;

    if (!id || !roleId || !levelId || !fromAmount || !toAmount) {
      return res.status(400).json({
        success: false,
        message: "All field are required",
      });
    }

    if (!structure.earnings || !structure.deductions) {
      return res.status(400).json({
        success: false,
        message: "Earnings and Deductions are required",
      });
    }

    const slab = await SalarySlab.findByPk(id);

    if (!slab) {
      return res.status(404).json({
        success: false,
        message: "Salary structure not found",
      });
    }

    (slab.roleId = roleId),
      (slab.levelId = levelId),
      (slab.fromAmount = fromAmount),
      (slab.toAmount = toAmount),
      (slab.structure = structure);
    await slab.save();

    res.status(200).json({
      success: true,
      message: "Salary Slab updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update salary structure",
    });
  }
};

exports.deleteSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Salary slab id is required",
      });
    }

    const slab = await SalarySlab.findByPk(id);

    if (!slab) {
      return res.status(400).json({
        success: false,
        message: "Salary Slab not found",
      });
    }

    await slab.destroy();

    res.status(200).json({
      success: true,
      message: "Salary Slab deleted successfully!",
    });
  } catch (error) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete salary structure.",
    });
  }
};
