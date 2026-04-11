require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const mobile = await prisma.category.upsert({
    where: { slug: "mobile" },
    update: {
      name: "Dien thoai",
      description: "Danh muc smartphone",
    },
    create: {
      name: "Dien thoai",
      slug: "mobile",
      description: "Danh muc smartphone",
    },
  });

  const products = [
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      price: 27990000,
      stock: 50,
      categoryId: mobile.id,
    },
    {
      name: "Samsung Galaxy S24",
      slug: "samsung-galaxy-s24",
      price: 22990000,
      stock: 30,
      categoryId: mobile.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
