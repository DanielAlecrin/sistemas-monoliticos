import { Sequelize } from "sequelize-typescript";
import Id from "../../@shared/domain/value-object/id.value-object";
import Address from "../../@shared/domain/value-object/address";
import { InvoiceModel } from "./invoice.model";
import { InvoiceItemsModel } from "./invoice-items.model";
import Invoice from "../domain/invoice.entity";
import InvoiceRepository from "./invoice.repository";
import InvoiceItems from "../domain/invoice-items.entity";

describe("Invoice Repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, InvoiceItemsModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a invoice", async () => {
    const invoice = new Invoice({
      id: new Id("1"),
      name: "Lucian",
      document: "1234-5678",
      address: new Address(
        "Rua 123",
        "99",
        "Casa Verde",
        "Criciúma",
        "SC",
        "88888-888"
      ),
      items: [
        new InvoiceItems({
          id: new Id("123"),
          name: "Carro",
          price: 100,
        }),
      ],
    });

    const repository = new InvoiceRepository();
    await repository.generate(invoice);

    const invoiceModelDb = await InvoiceModel.findOne({
      where: { id: "1" },
      include: [InvoiceItemsModel],
    });

    expect(invoiceModelDb).toBeDefined();
    expect(invoiceModelDb.id).toEqual(invoice.id.id);
    expect(invoiceModelDb.name).toEqual(invoice.name);
    expect(invoiceModelDb.document).toEqual(invoice.document);
    expect(invoiceModelDb.street).toEqual(invoice.address.street);
    expect(invoiceModelDb.number).toEqual(invoice.address.number);
    expect(invoiceModelDb.complement).toEqual(invoice.address.complement);
    expect(invoiceModelDb.city).toEqual(invoice.address.city);
    expect(invoiceModelDb.state).toEqual(invoice.address.state);
    expect(invoiceModelDb.zipcode).toEqual(invoice.address.zipCode);
    expect(invoiceModelDb.createdAt).toStrictEqual(invoice.createdAt);
    expect(invoiceModelDb.updatedAt).toStrictEqual(invoice.updatedAt);
    expect(invoiceModelDb.items.length).toBe(1);
  });

  it("should find a invoice", async () => {
    const invoice = await InvoiceModel.create({
      id: "1",
      name: "Lucian",
      document: "1234-5678",
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipcode: "88888-888",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const invoiceItem1 = await InvoiceItemsModel.create({
      id: "123",
      name: "Carro",
      price: 100,
      invoiceId: invoice.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const invoiceItem2 = await InvoiceItemsModel.create({
      id: "456",
      name: "Lampada",
      price: 50,
      invoiceId: invoice.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await invoice.$set("items", [invoiceItem1, invoiceItem2]);

    const repository = new InvoiceRepository();
    const result = await repository.find(invoice.id);

    expect(result.id.id).toEqual(invoice.id);
    expect(result.name).toEqual(invoice.name);
    expect(result.document).toEqual(invoice.document);
    expect(result.address.street).toEqual(invoice.street);
    expect(result.address.number).toEqual(invoice.number);
    expect(result.address.complement).toEqual(invoice.complement);
    expect(result.address.city).toEqual(invoice.city);
    expect(result.address.state).toEqual(invoice.state);
    expect(result.address.zipCode).toEqual(invoice.zipcode);
    expect(result.createdAt).toStrictEqual(invoice.createdAt);
    expect(result.updatedAt).toStrictEqual(invoice.updatedAt);
    expect(result.items.length).toBe(2);
  });
});
