import React from "react";
import WalletCreateDrawer from "../../src/components/WalletCreateDrawer";

describe("WalletCreateDrawer Component", () => {
  const mountDrawer = (
    props: Partial<React.ComponentProps<typeof WalletCreateDrawer>> = {},
  ) => {
    const onClose = cy.spy().as("onClose");
    const onCreate = cy.spy().as("onCreate");
    const defaultProps = {
      open: true,
      onClose,
      onCreate,
      existingNames: [] as string[],
    };
    cy.mount(<WalletCreateDrawer {...defaultProps} {...props} />);
    return { onClose, onCreate };
  };

  const getNameInput = () => cy.get('input[name="name"]');
  const getDescInput = () => cy.get('input[name="description"]');
  const getCreateBtn = () => cy.contains("button", "Create Wallet");
  const getCloseBtn = () => cy.get('button[aria-label="close"]');
  const getErrorHelper = () => cy.get('[data-test="error-helper-text"]');

  it("renders when open and closes immediately when clean (no confirm)", () => {
    const { onClose } = mountDrawer({ open: true });

    cy.contains("Provide wallet details").should("exist");

    getCloseBtn().click();
    cy.get("@onClose").should("have.been.calledOnce");
  });

  it("does not render when open = false", () => {
    cy.mount(
      <WalletCreateDrawer
        open={false}
        onClose={cy.spy().as("onClose")}
        onCreate={cy.spy().as("onCreate")}
        existingNames={[]}
      />,
    );
    cy.contains("Provide wallet details").should("not.exist");
  });

  it('disables "Create Wallet" until both name and description are filled', () => {
    mountDrawer();

    getCreateBtn().should("be.disabled");

    getNameInput().type("   ");
    getCreateBtn().should("be.disabled");

    getNameInput().clear().type("My Wallet");
    getCreateBtn().should("be.disabled");

    getDescInput().type("   ");
    getCreateBtn().should("be.disabled");

    getDescInput().clear().type("A test description");
    getCreateBtn().should("not.be.disabled");
  });

  it("calls onCreate with trimmed payload, then calls onClose", () => {
    const { onCreate, onClose } = mountDrawer();

    getNameInput().type("  My Wallet  ");
    getDescInput().type("  A test description  ");

    getCreateBtn().click();

    cy.get("@onCreate").should("have.been.calledOnce");
    cy.get("@onCreate")
      .its("firstCall.args.0")
      .should((payload: any) => {
        expect(payload).to.deep.equal({
          name: "My Wallet",
          description: "A test description",
        });
      });

    cy.get("@onClose").should("have.been.calledOnce");
  });

  it("keeps the drawer open and shows the API message when onCreate rejects", () => {
    const apiMessage = 'The wallet "test" already exists';
    const onClose = cy.spy().as("onClose");
    cy.mount(
      <WalletCreateDrawer
        open
        onClose={onClose}
        onCreate={() => Promise.reject(new Error(apiMessage))}
        existingNames={[]}
      />,
    );

    getNameInput().type("test");
    getDescInput().type("A test description");
    getCreateBtn().click();

    getErrorHelper().should("contain.text", apiMessage);
    cy.contains("Provide wallet details").should("exist");
    cy.get("@onClose").should("not.have.been.called");
  });

  it("drops an error that arrives after the drawer was closed", () => {
    let rejectCreate: (e: Error) => void = () => {};
    const Harness = () => {
      const [open, setOpen] = React.useState(true);
      return (
        <>
          <button data-test="reopen" onClick={() => setOpen(true)}>
            reopen
          </button>
          <WalletCreateDrawer
            open={open}
            onClose={() => setOpen(false)}
            onCreate={() =>
              new Promise<void>((_, reject) => {
                rejectCreate = reject;
              })
            }
            existingNames={[]}
          />
        </>
      );
    };

    cy.mount(<Harness />);
    getNameInput().type("test");
    getDescInput().type("A test description");
    getCreateBtn().click();

    // close while the request is still in flight, then let it fail
    getCloseBtn().click();
    cy.contains("button", "DISCARD").click();
    cy.then(() => rejectCreate(new Error('The wallet "test" already exists')));

    cy.get('[data-test="reopen"]').click();
    getNameInput().should("have.value", "");
    getErrorHelper().should("not.exist");
  });

  it("shows duplicate helper text and disables Create when name exists (case-insensitive)", () => {
    mountDrawer({ existingNames: ["My Wallet"] });

    getNameInput().type("my wallet");
    getErrorHelper().should("contain.text", "Wallet name should be unique.");
    getCreateBtn().should("be.disabled");
  });

  it("dirty close shows confirm dialog; KEEP leaves open; DISCARD triggers onClose", () => {
    const { onClose } = mountDrawer();

    getNameInput().type("Temp");

    getCloseBtn().click();
    cy.contains("Discard changes?").should("be.visible");
    cy.contains("Are you sure you want to discard the new wallet?").should(
      "be.visible",
    );

    cy.contains("button", "KEEP CHANGES").click();
    cy.contains("Provide wallet details").should("exist");
    cy.get("@onClose").should("not.have.been.called");

    getCloseBtn().click();
    cy.contains("button", "DISCARD").click();
    cy.get("@onClose").should("have.been.calledOnce");
  });
});
