import { app, sequelize } from "../../express";
import request from "supertest";

describe("E2E test for customer", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should create a product", async () => {
    const response = await request(app).post("/product").send({
      name: "Product",
      description: "Description",
      purchasePrice: 100,
      stock: 100,
    });

    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe("Product");
    expect(response.body.description).toBe("Description");
    expect(response.body.purchasePrice).toBe(100);
    expect(response.body.stock).toBe(100);
  });
});
