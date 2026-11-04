import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { createGuideClient, SearchQueryMode } from "../dist/index.js";
import { SearchQueryMode as typeEntryMode } from "../dist/types.js";

const require = createRequire(import.meta.url);

test("ESM and CommonJS builds expose the same public client and contracts", () => {
  const cjs = require("../dist/index.cjs");
  const contracts = require("../dist/types.cjs");
  assert.equal(typeof createGuideClient, "function");
  assert.equal(typeof cjs.createGuideClient, "function");
  assert.deepEqual(cjs.SearchQueryMode, SearchQueryMode);
  assert.deepEqual(contracts.SearchQueryMode, typeEntryMode);
  assert.equal(typeof cjs.createGuideClient().search.query, "function");
});
