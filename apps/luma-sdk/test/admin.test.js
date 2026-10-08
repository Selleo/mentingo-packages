import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createServer } from "node:http";
import { test } from "node:test";

import {
  AiModelDomain,
  AiModelProfileKind,
  createLumaClient,
  LUMA_AI_MODEL_DOMAINS,
  LUMA_AI_MODEL_PROFILE_KINDS,
} from "../dist/index.js";

const ORGANIZATION_ID = "organization-123";
const API_KEY_ID = "api-key-123";

const startRecorder = async (responseBody = {}, statusCode = 200) => {
  const requests = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) {
      chunks.push(chunk);
    }

    const rawBody = Buffer.concat(chunks).toString();
    requests.push({
      method: request.method,
      path: request.url,
      headers: request.headers,
      body: rawBody ? JSON.parse(rawBody) : undefined,
    });

    response.writeHead(statusCode, { "content-type": "application/json" });
    response.end(JSON.stringify(responseBody));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Test server did not expose an address");
  }

  return {
    requests,
    baseURL: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
};

const withRecorder = async (responseBody, callback, statusCode = 200) => {
  const recorder = await startRecorder(responseBody, statusCode);
  try {
    return await callback(recorder);
  } finally {
    await recorder.close();
  }
};

const createClient = (baseURL, options = {}) =>
  createLumaClient({
    baseURL,
    apiKey: "admin-secret",
    ...options,
  });

const assertAdminHeadersOnly = (request) => {
  assert.equal(request.headers["x-admin-api-key"], "admin-secret");
  assert.equal(request.headers["x-api-key"], undefined);
};

test("admin apiKeys.list uses the admin credential and exact GET path", async () => {
  await withRecorder([], async ({ baseURL, requests }) => {
    const result = await createClient(baseURL).admin.apiKeys.list({
      organizationId: ORGANIZATION_ID,
    });
    assert.deepEqual(result, []);
    assert.deepEqual(requests[0].method, "GET");
    assert.deepEqual(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys`,
    );
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin apiKeys.create uses the exact POST path and body", async () => {
  await withRecorder({ id: API_KEY_ID }, async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.apiKeys.create({
      organizationId: ORGANIZATION_ID,
      name: "New key",
    });
    assert.equal(requests[0].method, "POST");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys`,
    );
    assert.deepEqual(requests[0].body, { name: "New key" });
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin apiKeys.get uses the exact GET path", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.apiKeys.get({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
    });
    assert.equal(requests[0].method, "GET");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys/${API_KEY_ID}`,
    );
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin apiKeys.update uses the exact PATCH path and body", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.apiKeys.update({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
      name: "Renamed key",
    });
    assert.equal(requests[0].method, "PATCH");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys/${API_KEY_ID}`,
    );
    assert.deepEqual(requests[0].body, { name: "Renamed key" });
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin apiKeys.revoke uses the exact DELETE path", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.apiKeys.revoke({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
    });
    assert.equal(requests[0].method, "DELETE");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys/${API_KEY_ID}`,
    );
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin apiKeys.getConfiguration uses the exact GET path", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.apiKeys.getConfiguration({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
    });
    assert.equal(requests[0].method, "GET");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys/${API_KEY_ID}/configuration`,
    );
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin apiKeys.listAssignments uses the exact GET path", async () => {
  await withRecorder([], async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.apiKeys.listAssignments({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
    });
    assert.equal(requests[0].method, "GET");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys/${API_KEY_ID}/ai-model-assignments`,
    );
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin apiKeys.updateAssignment uses the exact PATCH path and body", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.apiKeys.updateAssignment({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
      domain: LUMA_AI_MODEL_DOMAINS.AI_MENTOR,
      mode: "custom",
      modelProfileId: "profile-123",
    });
    assert.equal(requests[0].method, "PATCH");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/api-keys/${API_KEY_ID}/ai-model-assignments/aiMentor`,
    );
    assert.deepEqual(requests[0].body, { mode: "custom", modelProfileId: "profile-123" });
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin modelProfiles.list uses the exact GET path", async () => {
  await withRecorder([], async ({ baseURL, requests }) => {
    await createClient(baseURL).admin.modelProfiles.list({ organizationId: ORGANIZATION_ID });
    assert.equal(requests[0].method, "GET");
    assert.equal(
      requests[0].path,
      `/api/public/v1/admin/organizations/${ORGANIZATION_ID}/ai-model-profiles`,
    );
    assertAdminHeadersOnly(requests[0]);
  });
});

test("admin model domain constants exhaustively match the generated enum", () => {
  assert.deepEqual(
    Object.values(LUMA_AI_MODEL_DOMAINS).sort(),
    Object.values(AiModelDomain).sort(),
  );
});

test("all admin operations omit X-API-Key", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    const client = createClient(baseURL);
    await client.admin.apiKeys.list({ organizationId: ORGANIZATION_ID });
    await client.admin.apiKeys.create({ organizationId: ORGANIZATION_ID, name: "New key" });
    await client.admin.apiKeys.get({ organizationId: ORGANIZATION_ID, apiKeyId: API_KEY_ID });
    await client.admin.apiKeys.update({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
      name: "Renamed key",
    });
    await client.admin.apiKeys.revoke({ organizationId: ORGANIZATION_ID, apiKeyId: API_KEY_ID });
    await client.admin.apiKeys.getConfiguration({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
    });
    await client.admin.apiKeys.listAssignments({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
    });
    await client.admin.apiKeys.updateAssignment({
      organizationId: ORGANIZATION_ID,
      apiKeyId: API_KEY_ID,
      domain: LUMA_AI_MODEL_DOMAINS.AI_MENTOR,
      mode: "custom",
    });
    await client.admin.modelProfiles.list({ organizationId: ORGANIZATION_ID });

    assert.equal(requests.length, 9);
    for (const request of requests) {
      assertAdminHeadersOnly(request);
    }
  });
});

test("admin HTTP errors propagate to callers", async () => {
  await withRecorder(
    { detail: "upstream unavailable" },
    async ({ baseURL, requests }) => {
      const client = createClient(baseURL);
      await assert.rejects(
        client.admin.apiKeys.get({ organizationId: ORGANIZATION_ID, apiKeyId: API_KEY_ID }),
        (error) => {
          assert.equal(error.response?.status, 503);
          return true;
        },
      );
      assert.equal(requests.length, 1);
    },
    503,
  );
});

test("admin methods fail locally without apiKey and make no request", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    const client = createLumaClient({ baseURL });
    await assert.rejects(
      client.admin.apiKeys.list({ organizationId: ORGANIZATION_ID }),
      /Luma API key is required/,
    );
    assert.equal(requests.length, 0);
  });
});

test("admin clients use the single apiKey option", async () => {
  await withRecorder([], async ({ baseURL, requests }) => {
    const client = createLumaClient({ baseURL, apiKey: "admin-secret" });
    await client.admin.apiKeys.list({ organizationId: ORGANIZATION_ID });
    assert.equal(requests[0].headers["x-admin-api-key"], "admin-secret");
    assert.equal(requests[0].headers["x-api-key"], undefined);
  });
});

test("public feature operations send apiKey only as X-API-Key", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    await createClient(baseURL, { apiKey: "feature-secret" }).configuration.get();
    assert.equal(requests[0].method, "GET");
    assert.equal(requests[0].path, "/api/public/v1/ai/configuration");
    assert.equal(requests[0].headers["x-api-key"], "feature-secret");
    assert.equal(requests[0].headers["x-admin-api-key"], undefined);
  });
});

test("a client always uses the same supplied key for both endpoint groups", async () => {
  await withRecorder({}, async ({ baseURL, requests }) => {
    const client = createClient(baseURL, { apiKey: "single-client-key" });
    await client.admin.apiKeys.list({ organizationId: ORGANIZATION_ID });
    await client.configuration.get();

    assert.equal(requests[0].headers["x-admin-api-key"], "single-client-key");
    assert.equal(requests[0].headers["x-api-key"], undefined);
    assert.equal(requests[1].headers["x-api-key"], "single-client-key");
    assert.equal(requests[1].headers["x-admin-api-key"], undefined);
  });
});

test("the API decides whether the supplied key can perform admin actions", async () => {
  await withRecorder(
    { detail: "INVALID_ADMIN_API_KEY" },
    async ({ baseURL, requests }) => {
      const client = createClient(baseURL, { apiKey: "feature-secret" });
      await assert.rejects(
        client.admin.apiKeys.list({ organizationId: ORGANIZATION_ID }),
        (error) => error.response?.status === 401,
      );
      assert.equal(requests[0].headers["x-admin-api-key"], "feature-secret");
    },
    401,
  );
});

test("the API can reject an admin key used for feature actions", async () => {
  await withRecorder(
    { detail: "INVALID_API_KEY" },
    async ({ baseURL, requests }) => {
      const client = createClient(baseURL);
      await assert.rejects(client.configuration.get(), (error) => error.response?.status === 401);
      assert.equal(requests[0].headers["x-api-key"], "admin-secret");
    },
    401,
  );
});

test("admin model profile kinds include image generation and match the generated enum", () => {
  assert.equal(LUMA_AI_MODEL_PROFILE_KINDS.IMAGE, "image");
  assert.deepEqual(
    Object.values(LUMA_AI_MODEL_PROFILE_KINDS).sort(),
    Object.values(AiModelProfileKind).sort(),
  );
});
