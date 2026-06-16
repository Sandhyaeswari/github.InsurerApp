import { INSURERS } from "../config/insurers";

const defaultHeaders = {
  "Content-Type": "application/json",
};

const parseResponse = async (res) => {
  const contentType = res.headers.get("content-type") || "";

  let responseData = null;

  try {
    if (contentType.includes("application/json")) {
      responseData = await res.json();
    } else {
      responseData = await res.text();
    }
  } catch (err) {
    console.error("Response parse error:", err);
  }

  if (!res.ok) {
    console.error("API Error Response:", responseData);

    throw new Error(
      typeof responseData === "string"
        ? responseData
        : JSON.stringify(responseData)
    );
  }

  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.records)) {
    return responseData.records;
  }

  return responseData;
};

const buildHeaders = (insurer) => {
  const headers = {
    ...defaultHeaders,
  };

  if (insurer?.lienToken) {
    headers.Authorization = `Bearer ${insurer.lienToken}`;
  }

  return headers;
};

const getInsurer = (insurerKey) => {
  const insurer = INSURERS?.[insurerKey];

  if (!insurer) {
    throw new Error(`Invalid insurerKey: ${insurerKey}`);
  }

  return insurer;
};

export const fetchRecords = async (insurerKey) => {
  try {
    const insurer = getInsurer(insurerKey);

    if (!insurer.getUrl) {
      throw new Error(`getUrl missing for ${insurerKey}`);
    }

    const res = await fetch(insurer.getUrl, {
      method: "GET",
      headers: defaultHeaders,
    });

    return await parseResponse(res);
  } catch (err) {
    console.error("fetchRecords error:", err);
    return [];
  }
};

export const updateRecord = async (
  insurerKey,
  id,
  payload
) => {
  try {
    const insurer = getInsurer(insurerKey);

    if (!insurer.putUrl) {
      throw new Error(`putUrl missing for ${insurerKey}`);
    }

    const res = await fetch(
      `${insurer.putUrl}/${id}`,
      {
        method: "PATCH",
        headers: defaultHeaders,
        body: JSON.stringify(payload),
      }
    );

    return await parseResponse(res);
  } catch (err) {
    console.error("updateRecord error:", err);
    return null;
  }
};

export const fetchDocs = async (insurerKey) => {
  try {
    const insurer = getInsurer(insurerKey);

    if (!insurer.getDocsUrl) {
      return [];
    }

    const res = await fetch(insurer.getDocsUrl, {
      method: "GET",
      headers: defaultHeaders,
    });

    return await parseResponse(res);
  } catch (err) {
    console.error("fetchDocs error:", err);
    return [];
  }
};

export const sendLienAction = async (
  insurerKey,
  payload
) => {
  try {
    const insurer = getInsurer(insurerKey);

    if (!insurer.lienUrl) {
      throw new Error(
        `Lien API not configured for ${insurerKey}`
      );
    }

    console.log(
      `[${insurerKey}] Sending Lien Action`,
      payload
    );

    const res = await fetch(insurer.lienUrl, {
      method: "POST",
      headers: buildHeaders(insurer),
      body: JSON.stringify(payload),
    });

    const parsed = await parseResponse(res);

    console.log(
      `[${insurerKey}] Lien Action Success`,
      parsed
    );

    return parsed;
  } catch (err) {
    console.error("sendLienAction error:", err);
    return null;
  }
};

const HISTORY_BASE_URL = "https://x8ki-letl-twmt.n7.xano.io/api:JtTOpcLE/insurer_history";

export const fetchHistory = async (lienRequestId) => {
  try {
    const res = await fetch(`${HISTORY_BASE_URL}/${lienRequestId}`, {
      method: "GET",
      headers: defaultHeaders,
    });
    return await parseResponse(res);
  } catch (err) {
    console.error("fetchHistory error:", err);
    return [];
  }
};

export const saveHistory = async (entry) => {
  try {
    const res = await fetch(HISTORY_BASE_URL, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(entry),
    });
    return await parseResponse(res);
  } catch (err) {
    console.error("saveHistory error:", err);
    return null;
  }
};

export const sendLienReleaseAction = async (
  insurerKey,
  payload
) => {
  try {
    const insurer = getInsurer(insurerKey);

    if (!insurer.lienReleaseUrl) {
      throw new Error(
        `Lien Release API not configured for ${insurerKey}`
      );
    }

    console.log(
      `[${insurerKey}] Sending Release Action`,
      payload
    );

    const res = await fetch(
      insurer.lienReleaseUrl,
      {
        method: "POST",
        headers: buildHeaders(insurer),
        body: JSON.stringify(payload),
      }
    );

    const parsed = await parseResponse(res);

    console.log(
      `[${insurerKey}] Release Action Success`,
      parsed
    );

    return parsed;
  } catch (err) {
    console.error(
      "sendLienReleaseAction error:",
      err
    );

    return null;
  }
};