import "./env.js";

const requiredDataverseEnv = [
  "DATAVERSE_URL",
  "DATAVERSE_TENANT_ID",
  "DATAVERSE_CLIENT_ID",
  "DATAVERSE_CLIENT_SECRET",
];

function cleanBaseUrl(value) {
  return String(value || "").replace(/\/$/, "");
}

function hasPlaceholderValue(value) {
  return !value || String(value).startsWith("your-");
}

export function getDataverseConfigStatus() {
  const missing = requiredDataverseEnv.filter((key) =>
    hasPlaceholderValue(process.env[key])
  );

  return {
    configured: missing.length === 0,
    missing,
    url: cleanBaseUrl(process.env.DATAVERSE_URL),
    studentsTable: process.env.DATAVERSE_STUDENTS_TABLE || "contacts",
  };
}

async function getAccessToken() {
  const status = getDataverseConfigStatus();

  if (!status.configured) {
    throw new Error(`Dataverse configuration is incomplete: ${status.missing.join(", ")}`);
  }

  const tokenUrl = `https://login.microsoftonline.com/${process.env.DATAVERSE_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: process.env.DATAVERSE_CLIENT_ID,
    client_secret: process.env.DATAVERSE_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: `${status.url}/.default`,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error_description || data?.error || "Failed to get Dataverse access token");
  }

  return data.access_token;
}

function escapeODataValue(value) {
  return String(value || "").replace(/'/g, "''");
}

export async function fetchDataverseRows(tableName, query = "") {
  const status = getDataverseConfigStatus();
  const accessToken = await getAccessToken();
  const normalizedQuery = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  const url = `${status.url}/api/data/v9.2/${tableName}${normalizedQuery}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || "Dataverse request failed");
  }

  return data;
}

export async function fetchDataverseStudent({ email, legacyId }) {
  const tableName = process.env.DATAVERSE_STUDENTS_TABLE || "contacts";
  const emailField = process.env.DATAVERSE_STUDENT_EMAIL_FIELD || "emailaddress1";
  const legacyIdField = process.env.DATAVERSE_STUDENT_LEGACY_ID_FIELD || "new_legacyid";
  const filters = [];

  if (email) filters.push(`${emailField} eq '${escapeODataValue(email)}'`);
  if (legacyId) filters.push(`${legacyIdField} eq '${escapeODataValue(legacyId)}'`);

  const query = new URLSearchParams({
    $top: "10",
  });

  if (filters.length) {
    query.set("$filter", filters.join(" or "));
  }

  return fetchDataverseRows(tableName, query.toString());
}
