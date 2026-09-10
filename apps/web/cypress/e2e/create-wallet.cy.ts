// apps/web/cypress/e2e/create-wallet.cy.ts
import { SELECTORS } from "../support/wallet-constants";

let walletData: {
  routes: { wallets: string };
  mocks: { initialList: any[]; createdWallet: { id: string; name: string } };
};

describe("Wallet - Create flow (integration, all requests mocked)", () => {
  before(() => {
    cy.fixture("wallet.json").then((data) => {
      walletData = data;
    });
  });

  beforeEach(() => {
    cy.intercept("GET", "**/wallets*", {
      statusCode: 200,
      body: walletData?.mocks?.initialList ?? [],
    }).as("getWallets");

    cy.visit(walletData.routes.wallets, {
      onBeforeLoad(win) {
        win.sessionStorage.setItem(
          "token",
          JSON.stringify("fake-token-for-tests"),
        );
      },
    });

    cy.wait("@getWallets");
  });

  it("happy path: jump -> input wallet name -> create", () => {
    const name = walletData.mocks.createdWallet.name;

    cy.getByData(SELECTORS.walletCreateOpen).click();

    cy.getByData(SELECTORS.walletNameInput).clear().type(name);
    cy.getByData(SELECTORS.walletDescriptionInput).clear().type("desc");

    cy.intercept("POST", "**/wallets", (req) => {
      expect(req.body).to.have.property("wallet", name);
      req.reply({ statusCode: 201, body: walletData.mocks.createdWallet });
    }).as("createWallet");

    cy.getByData(SELECTORS.walletCreateSubmitButton).click();

    cy.wait("@createWallet");

    cy.contains(name).should("exist");
  });

  it("description is required: submit stays disabled until it is filled", () => {
    cy.getByData(SELECTORS.walletCreateOpen).click();

    cy.getByData(SELECTORS.walletNameInput).type("A brand new wallet");
    cy.getByData(SELECTORS.walletCreateSubmitButton).should("be.disabled");

    cy.getByData(SELECTORS.walletDescriptionInput).type("desc");
    cy.getByData(SELECTORS.walletCreateSubmitButton).should("not.be.disabled");
  });

  it("server rejects the name: shows the API message and keeps the drawer open", () => {
    const takenName = "test";
    const apiMessage = `The wallet "${takenName}" already exists`;

    cy.intercept("POST", "**/wallets", {
      statusCode: 409,
      body: { message: apiMessage },
    }).as("createWalletConflict");

    cy.getByData(SELECTORS.walletCreateOpen).click();
    cy.getByData(SELECTORS.walletNameInput).type(takenName);
    cy.getByData(SELECTORS.walletDescriptionInput).type("desc");
    cy.getByData(SELECTORS.walletCreateSubmitButton).click();

    cy.wait("@createWalletConflict");

    cy.getByData(SELECTORS.errorHelperText).should("contain.text", apiMessage);
    cy.getByData(SELECTORS.walletNameInput).should("be.visible");
    cy.getByData(SELECTORS.walletList).should("not.contain.text", takenName);
  });

  it("client-side duplicate check: shows helper text and disables submit", () => {
    const dupName = walletData.mocks.createdWallet.name;

    cy.getByData(SELECTORS.walletCreateOpen).click();
    cy.getByData(SELECTORS.walletNameInput).type(dupName);
    cy.getByData(SELECTORS.walletDescriptionInput).type("desc");

    cy.intercept("POST", "**/wallets", (req) => {
      expect(req.body).to.have.property("wallet", dupName);
      req.reply({ statusCode: 201, body: walletData.mocks.createdWallet });
    }).as("createWallet");

    cy.getByData(SELECTORS.walletCreateSubmitButton).click();
    cy.wait("@createWallet");
    cy.contains(dupName).should("exist");

    cy.getByData(SELECTORS.walletCreateOpen).click();
    cy.getByData(SELECTORS.walletNameInput).type(dupName);
    cy.getByData(SELECTORS.errorHelperText).should("contain.text", "unique");
    cy.getByData(SELECTORS.walletCreateSubmitButton).should("be.disabled");
  });
});
