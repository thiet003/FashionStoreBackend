const pool = require('../db/connect_db');

// Thêm size
const addSize = async (req, res) => {
  const { size } = req.body;
  try {
    const [rows, fields] = await pool.query('INSERT INTO size (size_name) VALUES (?)', [size]);
    res.json({ status: 'success', message: 'Thêm size thành công!' });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ status: 'error', message: 'Lỗi kết nối đến server!' });
  }
}

// Thêm sản phẩm
const addProduct = async (req, res) => {
  try {
    // Lấy dữ liệu từ body
    const {
      name,
      description,
      originalPrice,
      discount,
      thumbnail,
      subThumbnail,
      shortDesc,
      isNew,
      categories, // Danh sách tên category
      colors,     // Danh sách tên color
      sizes,      // Danh sách tên size
      images      // Danh sách ảnh chi tiết (URLs)
    } = req.body;

    // 1. Thêm sản phẩm vào bảng `product`
    const [productResult] = await pool.execute(
      `INSERT INTO product (name, description, original_price, discount, thumbnail, sub_thumbnail, short_desc, is_new) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, originalPrice, discount, thumbnail, subThumbnail, shortDesc, isNew]
    );
    const productId = productResult.insertId;

    // 2. Xử lý categories
    for (const categoryName of categories) {
      // Kiểm tra xem category có tồn tại chưa, nếu chưa thì thêm mới
      let [category] = await pool.execute(
        `SELECT id FROM category WHERE name = ?`,
        [categoryName]
      );
      if (category.length === 0) {
        console.log("Thêm mới category" + categoryName);

        const [newCategory] = await pool.execute(
          `INSERT INTO category (name) VALUES (?)`,
          [categoryName]
        );
        category = [{ id: newCategory.insertId }];
      }
      // Thêm quan hệ vào bảng `product_category`
      await pool.execute(
        `INSERT INTO product_category (product_id, category_id) VALUES (?, ?)`,
        [productId, category[0].id]
      );
    }

    // 3. Xử lý colors
    const colorMap = {};
    for (const colorName of colors) {
      // Kiểm tra xem color có tồn tại chưa, nếu chưa thì thêm mới
      let [color] = await pool.execute(
        `SELECT id FROM color WHERE color_name = ?`,
        [colorName]
      );
      if (color.length === 0) {
        console.log("Thêm mới color " + colorName);

        const [newColor] = await pool.execute(
          `INSERT INTO color (color_name) VALUES (?)`,
          [colorName]
        );
        color = [{ id: newColor.insertId }];
      }
      colorMap[colorName] = color[0].id;
    }

    // 4. Xử lý sizes
    const sizeMap = {};
    for (const sizeName of sizes) {
      // Kiểm tra xem size có tồn tại chưa, nếu chưa thì thêm mới
      let [size] = await pool.execute(
        `SELECT id FROM size WHERE size_name = ?`,
        [sizeName]
      );
      if (size.length === 0) {
        console.log("Thêm mới size " + sizeName);
        const [newSize] = await pool.execute(
          `INSERT INTO size (size_name) VALUES (?)`,
          [sizeName]
        );
        size = [{ id: newSize.insertId }];
      }
      sizeMap[sizeName] = size[0].id;
    }

    // 5. Thêm tất cả cặp color-size vào `product_quantity` với quantity mặc định = 0
    for (const colorName of colors) {
      for (const sizeName of sizes) {
        const colorId = colorMap[colorName];
        const sizeId = sizeMap[sizeName];
        await pool.execute(
          `INSERT INTO product_quantity (product_id, color_id, size_id, quantity) VALUES (?, ?, ?, 0)`,
          [productId, colorId, sizeId]
        );
      }
    }

    // 6. Xử lý danh sách ảnh chi tiết
    for (const imageLink of images) {
      await pool.execute(
        `INSERT INTO product_image (product_id, image_link) VALUES (?, ?)`,
        [productId, imageLink]
      );
    }

    // Trả về kết quả
    res.status(201).json({ status: 'success', message: 'Thêm sản phẩm thành công!', productId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Lỗi kết nối đến server!' });
  }
};
// Lấy danh sách sản phẩm
// Danh sách query params: page, limit, sortBy, sortType, search, categoryName, startPrice, endPrice
const getProducts = async (req, res) => {
  try {
    // Lấy query params
    let { page, limit, sortBy, sortType, search, categoryName, startPrice, endPrice } = req.query;
    page = page ? parseInt(page) : 1; // Mặc định là trang 1
    limit = limit ? parseInt(limit) : 10; // Mặc định là 10 sản phẩm mỗi trang
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM product`;
    let countQuery = `SELECT COUNT(*) as total FROM product`;
    let condition = '';
    let params = [];
    let countParams = [];

    // Xử lý search
    if (search) {
      condition += ` WHERE name LIKE ?`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    // Xử lý categoryName
    if (categoryName) {
      const categoryCondition = `id IN (
        SELECT product_id 
        FROM product_category 
        WHERE category_id IN (
          SELECT id 
          FROM category 
          WHERE LOWER(name) = LOWER(?)
        )
      )`;
      condition += condition ? ` AND ${categoryCondition}` : ` WHERE ${categoryCondition}`;
      params.push(categoryName);
      countParams.push(categoryName);
    }

    // Xử lý startPrice và endPrice
    if (startPrice && endPrice) {
      const priceCondition = `original_price BETWEEN ? AND ?`;
      condition += condition ? ` AND ${priceCondition}` : ` WHERE ${priceCondition}`;
      params.push(startPrice, endPrice);
      countParams.push(startPrice, endPrice);
    }

    // Xử lý sort
    if (sortBy) {
      if (!sortType) {
        sortType = 'ASC'; // Mặc định sắp xếp tăng dần
      }
      const allowedSortFields = ['name', 'original_price']; // Chỉ cho phép 'name' hoặc 'original_price'
      const allowedSortTypes = ['ASC', 'DESC']; // Chỉ cho phép 'ASC' hoặc 'DESC'

      if (allowedSortFields.includes(sortBy) && allowedSortTypes.includes(sortType.toUpperCase())) {
        query += condition + ` ORDER BY ${sortBy} ${sortType.toUpperCase()}`;
      } else {
        query += condition;
      }
    } else {
      query += condition;
    }

    // Thêm phân trang
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Thực thi query đếm tổng sản phẩm
    const [countResult] = await pool.execute(countQuery + condition, countParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Thực thi query lấy sản phẩm
    const [products] = await pool.execute(query, params);

    // Lấy số lượng color và size cho từng sản phẩm
    const productIds = products.map(product => product.id);
    let colorSizeQuery = `
      SELECT 
        product_id, 
        COUNT(DISTINCT color_id) AS color_count, 
        COUNT(DISTINCT size_id) AS size_count 
      FROM product_quantity 
      WHERE product_id IN (${productIds.join(',')})
      GROUP BY product_id
    `;
    const [colorSizeData] = await pool.execute(colorSizeQuery);

    // Kết hợp số lượng color và size với sản phẩm
    const filteredProducts = products.map(product => {
      const colorSizeInfo = colorSizeData.find(data => data.product_id === product.id) || { color_count: 0, size_count: 0 };
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        original_price: product.original_price,
        discount: product.discount,
        final_price: product.final_price,
        thumbnail: product.thumbnail,
        sub_thumbnail: product.sub_thumbnail,
        short_desc: product.short_desc,
        is_new: product.is_new,
        color_count: colorSizeInfo.color_count,
        size_count: colorSizeInfo.size_count
      };
    });

    // Trả dữ liệu về client
    res.json({
      status: 'success',
      data: filteredProducts,
      page,
      totalPages,
      totalItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Lỗi kết nối đến server!' });
  }
};


const getDiscountProducts = async (req, res) => {
  try {
    // Lấy query params
    let { page, limit } = req.query;
    page = page ? parseInt(page, 10) : 1; // Mặc định là trang 1
    limit = limit ? parseInt(limit, 10) : 10; // Mặc định là 10 sản phẩm mỗi trang
    const offset = (page - 1) * limit;

    // Query lấy sản phẩm khuyến mãi
    const query = `SELECT * FROM product WHERE discount > 0 LIMIT ${limit} OFFSET ${offset}`;
    const countQuery = `SELECT COUNT(*) as total FROM product WHERE discount > 0`;

    // Thực thi query đếm tổng sản phẩm khuyến mãi
    const [countResult] = await pool.execute(countQuery);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Thực thi query lấy sản phẩm khuyến mãi
    const [products] = await pool.execute(query);

    // Lấy danh sách product_id để đếm color và size
    const productIds = products.map(product => product.id);
    if (productIds.length > 0) {
      const colorSizeQuery = `
        SELECT 
          product_id, 
          COUNT(DISTINCT color_id) AS color_count, 
          COUNT(DISTINCT size_id) AS size_count 
        FROM product_quantity 
        WHERE product_id IN (${productIds.join(',')})
        GROUP BY product_id
      `;
      const [colorSizeData] = await pool.execute(colorSizeQuery);

      // Kết hợp số lượng color và size với sản phẩm
      const filteredProducts = products.map(product => {
        const colorSizeInfo = colorSizeData.find(data => data.product_id === product.id) || { color_count: 0, size_count: 0 };
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          original_price: product.original_price,
          discount: product.discount,
          final_price: product.final_price,
          thumbnail: product.thumbnail,
          sub_thumbnail: product.sub_thumbnail,
          short_desc: product.short_desc,
          is_new: product.is_new,
          color_count: colorSizeInfo.color_count,
          size_count: colorSizeInfo.size_count
        };
      });

      // Trả dữ liệu về client
      return res.json({
        status: 'success',
        data: filteredProducts,
        page,
        totalPages,
        totalItems
      });
    } else {
      // Trả về khi không có sản phẩm
      return res.json({
        status: 'success',
        data: [],
        page,
        totalPages: 0,
        totalItems: 0
      });
    }
  } catch (error) {
    console.error('Error in getDiscountProducts:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi kết nối đến server!' });
  }
};
const getNewProducts = async (req, res) => {
  try {
    // Lấy query params
    let { page, limit } = req.query;
    page = page ? parseInt(page) : 1; // Mặc định là trang 1
    limit = limit ? parseInt(limit) : 10; // Mặc định là 10 sản phẩm mỗi trang
    const offset = (page - 1) * limit;

    // Query lấy sản phẩm mới
    const query = `SELECT * FROM product WHERE is_new = 1 LIMIT ${limit} OFFSET ${offset}`;
    const countQuery = `SELECT COUNT(*) as total FROM product WHERE is_new = 1`;

    // Thực thi query đếm tổng sản phẩm mới
    const [countResult] = await pool.execute(countQuery);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Thực thi query lấy sản phẩm mới
    const [products] = await pool.execute(query);

    // Lấy danh sách product_id để đếm color và size
    const productIds = products.map(product => product.id);
    if (productIds.length > 0) {
      const colorSizeQuery = `
        SELECT 
          product_id, 
          COUNT(DISTINCT color_id) AS color_count, 
          COUNT(DISTINCT size_id) AS size_count 
        FROM product_quantity 
        WHERE product_id IN (${productIds.join(',')})
        GROUP BY product_id
      `;
      const [colorSizeData] = await pool.execute(colorSizeQuery);

      // Kết hợp số lượng color và size với sản phẩm
      const filteredProducts = products.map(product => {
        const colorSizeInfo = colorSizeData.find(data => data.product_id === product.id) || { color_count: 0, size_count: 0 };
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          original_price: product.original_price,
          discount: product.discount,
          final_price: product.final_price,
          thumbnail: product.thumbnail,
          sub_thumbnail: product.sub_thumbnail,
          short_desc: product.short_desc,
          is_new: product.is_new,
          color_count: colorSizeInfo.color_count,
          size_count: colorSizeInfo.size_count
        };
      });

      // Trả dữ liệu về client
      return res.json({
        status: 'success',
        data: filteredProducts,
        page,
        totalPages,
        totalItems
      });
    } else {
      // Trả về khi không có sản phẩm mới
      return res.json({
        status: 'success',
        data: [],
        page,
        totalPages: 0,
        totalItems: 0
      });
    }
  } catch (error) {
    console.error('Error in getNewProducts:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi kết nối đến server!' });
  }
};

// Lấy chi tiết sản phẩm
const getProductDetail = async (req, res) => {
  // Lấy product_id từ URL
  const productId = req.params.id;

  try {
    // Query lấy thông tin sản phẩm
    const query = `SELECT * FROM product WHERE id = ?`;
    const [products] = await pool.execute(query, [productId]);

    // Kiểm tra xem sản phẩm có tồn tại không
    if (products.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy sản phẩm có id là ' + productId });
    }

    // Query lấy danh sách color và size của sản phẩm
    const colorSizeQuery = `
      SELECT 
        color.color_name, 
        size.size_name, 
        product_quantity.quantity 
      FROM product_quantity 
      INNER JOIN color ON product_quantity.color_id = color.id 
      INNER JOIN size ON product_quantity.size_id = size.id 
      WHERE product_quantity.product_id = ?
    `;
    const [colorSizeData] = await pool.execute(colorSizeQuery, [productId]);

    // Query lấy danh sách ảnh chi tiết của sản phẩm
    const imageQuery = `SELECT image_link FROM product_image WHERE product_id = ?`;
    const [imageData] = await pool.execute(imageQuery, [productId]);

    // Kết quả trả về
    const product = products[0];
    const colorSize = colorSizeData.map(data => ({
      color: data.color_name,
      size: data.size_name,
      quantity: data.quantity
    }));
    const images = imageData.map(data => data.image_link);

    res.json({
      status: 'success',
      data: {
        ...product,
        colorSize,
        images
      }
    });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ status: 'error', message: 'Lỗi kết nối đến server!' });
  }
}
module.exports = {
  addSize,
  addProduct,
  getProducts,
  getDiscountProducts,
  getNewProducts,
  getProductDetail
}