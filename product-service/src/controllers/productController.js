const prisma = require("../lib/prisma");
const {
  getCachedProducts,
  invalidateProductsCache,
  setCachedProducts,
} = require("../lib/productCache");

function toPlainProduct(product) {
  if (!product) {
    return product;
  }

  return {
    ...product,
    price: Number(product.price),
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getProducts(req, res, next) {
  try {
    const cachedPayload = await getCachedProducts(req.query);

    if (cachedPayload) {
      res.set("X-Cache", "HIT");
      return res.json(cachedPayload);
    }

    const page = Number.parseInt(req.query.page || "1", 10);
    const limit = Number.parseInt(req.query.limit || "10", 10);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || "";
    const category = req.query.category?.trim();
    const minPrice = req.query.minPrice ? Number.parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number.parseFloat(req.query.maxPrice) : undefined;
    const inStock = req.query.inStock === "true";
    const sortBy = ["name", "price"].includes(req.query.sortBy) ? req.query.sortBy : "id";
    const order = req.query.order === "asc" ? "asc" : "desc";

    const where = {
      isActive: true,
      ...(search
        ? {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
      ...((minPrice !== undefined || maxPrice !== undefined)
        ? {
            price: {
              ...(minPrice !== undefined ? { gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
            },
          }
        : {}),
      ...(inStock ? { stock: { gt: 0 } } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const payload = {
      success: true,
      data: products.map(toPlainProduct),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };

    await setCachedProducts(req.query, payload);

    res.set("X-Cache", "MISS");
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const productId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error("Product id is invalid.");
      error.statusCode = 400;
      throw error;
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!product) {
      const error = new Error("Product not found.");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: toPlainProduct(product),
    });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const slug = req.body.slug?.trim() || slugify(req.body.name);

    const product = await prisma.product.create({
      data: {
        name: req.body.name.trim(),
        slug,
        description: req.body.description?.trim() || null,
        price: req.body.price,
        stock: req.body.stock ?? 0,
        imageUrl: req.body.imageUrl?.trim() || null,
        isActive: req.body.isActive ?? true,
        categoryId: req.body.categoryId ?? null,
      },
      include: {
        category: true,
      },
    });

    await invalidateProductsCache();

    res.status(201).json({
      success: true,
      data: toPlainProduct(product),
      message: "Product created successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const productId = Number.parseInt(req.params.id, 10);
    const data = {
      ...req.body,
      ...(req.body.name ? { name: req.body.name.trim() } : {}),
      ...(req.body.slug ? { slug: req.body.slug.trim() } : {}),
      ...(req.body.description !== undefined
        ? { description: req.body.description?.trim() || null }
        : {}),
      ...(req.body.imageUrl !== undefined
        ? { imageUrl: req.body.imageUrl?.trim() || null }
        : {}),
    };

    if (data.name && !data.slug) {
      data.slug = slugify(data.name);
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: true,
      },
    });

    await invalidateProductsCache();

    res.json({
      success: true,
      data: toPlainProduct(product),
      message: "Product updated successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function uploadProductImage(req, res, next) {
  try {
    const productId = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(productId) || productId <= 0) {
      const error = new Error("Product id is invalid.");
      error.statusCode = 400;
      throw error;
    }

    if (!req.file?.path) {
      const error = new Error("Image upload failed.");
      error.statusCode = 400;
      throw error;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: req.file.path,
      },
      include: {
        category: true,
      },
    });

    await invalidateProductsCache();

    res.json({
      success: true,
      data: toPlainProduct(product),
      message: "Product image uploaded successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const productId = Number.parseInt(req.params.id, 10);

    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    await invalidateProductsCache();

    res.json({
      success: true,
      message: "Product hidden successfully.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  uploadProductImage,
  updateProduct,
};
