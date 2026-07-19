const { Product, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const clinicId = req.user.clinicId;

    if (!clinicId) {
      return res.status(403).json({ success: false, message: 'User must belong to a clinic' });
    }

    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }

    const dialect = sequelize.getDialect();
    let whereClause = { clinicId };

    if (dialect === 'postgres') {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${query}%` } },
        { sku: { [Op.iLike]: `%${query}%` } }
      ];
    } else {
      whereClause[Op.or] = [
        sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', `%${query.toLowerCase()}%`),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('sku')), 'LIKE', `%${query.toLowerCase()}%`)
      ];
    }

    const products = await Product.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'sku', 'price', 'stockQuantity', 'scheduleClass'],
      limit: 20
    });

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
