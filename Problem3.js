const axios = require("axios");
const fs = require("fs");

async function getAllProducts() {
  let skip = 0;
  let allProducts = [];

  while (true) {
    const result = await axios.get(
      `https://dummyjson.com/products?skip=${skip}`
    );

    const products = result.data.products;

    allProducts = allProducts.concat(products);

    skip += 30;

    if (skip >= result.data.total) {
      break;
    }
  }

  return allProducts;
}

const init = async () => {
  const product = await getAllProducts();

  //inventory value
  const inventory = product.map((pro) => ({
    ...pro,
    InventoryValue: pro.price * pro.stock,
  }));
  console.log(inventory);

  //status
  const status = inventory.map((pro) => ({
    ...pro,
    Status: pro.stock > 20 ? "IN_STOCK" : "LOW_STOCK",
  }));
  console.log(status);

  //only required fields
  const only_fields = status.map((pro) => ({
    ID: pro.id,
    Name: pro.title,
    Stock: pro.stock,
    InventoryValue: pro.InventoryValue,
    Status: pro.Status,
  }));
  console.log(only_fields);

  //write json file
  fs.writeFileSync(
    "inventory-report.json",
    JSON.stringify(only_fields, null, 3)
  );
  console.log("JSON file created successfully");
};

init();