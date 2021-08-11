import { expect, fixture } from "@open-wc/testing";
import { Spinner } from "../index";

describe("Spinner", () => {
  describe("render", () => {
    it('should have "KUC-SPINNER" tag name when not assigning any prop in constructor', async () => {
      const container = new Spinner({});
      const el = await fixture(container);
      expect(el.tagName).to.equal("KUC-SPINNER");
    });
  });
});
