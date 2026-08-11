import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_STUDIO_API_URL ??
    "http://127.0.0.1:8001/api/v1",
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

////////////////////////////////////////////////////////////
// Train AutoML
////////////////////////////////////////////////////////////

export async function trainAutoML(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const { data } = await API.post(
    "/automl/train",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Dataset Information
////////////////////////////////////////////////////////////

export async function getDatasetInfo(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await API.post(
    "/automl/dataset/info",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Dataset Preview
////////////////////////////////////////////////////////////

export async function getDatasetPreview(
  file: File,
  rows = 5
) {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await API.post(
    `/automl/dataset/preview?rows=${rows}`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Dataset Columns
////////////////////////////////////////////////////////////

export async function getDatasetColumns(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await API.post(
    "/automl/dataset/columns",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Dataset Shape
////////////////////////////////////////////////////////////

export async function getDatasetShape(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await API.post(
    "/automl/dataset/shape",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Executive Summary
////////////////////////////////////////////////////////////

export async function getSummary(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "target_column",
    targetColumn
  );

  const { data } = await API.post(
    "/automl/summary",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Leaderboard
////////////////////////////////////////////////////////////

export async function getLeaderboard(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "target_column",
    targetColumn
  );

  const { data } = await API.post(
    "/automl/leaderboard",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Best Model
////////////////////////////////////////////////////////////

export async function getBestModel(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "target_column",
    targetColumn
  );

  const { data } = await API.post(
    "/automl/best-model",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Recommendations
////////////////////////////////////////////////////////////

export async function getRecommendations(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "target_column",
    targetColumn
  );

  const { data } = await API.post(
    "/automl/recommendations",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Statistics
////////////////////////////////////////////////////////////

export async function getStatistics(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "target_column",
    targetColumn
  );

  const { data } = await API.post(
    "/automl/statistics",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return data;
}

////////////////////////////////////////////////////////////
// Complete AutoML Response
////////////////////////////////////////////////////////////

export async function getCompleteResponse(
  file: File,
  targetColumn: string
) {

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "target_column",
    targetColumn
  );

  console.log("Uploading File:", file.name);

  console.log("Target Column:", targetColumn);

  try {

    const { data } = await API.post(

      "/automl/complete",

      formData,

      {

        headers: {

          "Content-Type":
            "multipart/form-data",

        },

      }

    );

    console.log("SUCCESS");

    console.log(data);

    return data;

  }

  catch (error: any) {

    console.error("STATUS");

    console.error(error.response?.status);

    console.error("BACKEND RESPONSE");

    console.error(error.response?.data);

    throw error;

  }

}

////////////////////////////////////////////////////////////
// Health
////////////////////////////////////////////////////////////

export async function health() {
  const { data } = await API.get(
    "/automl/health"
  );

  return data;
}

////////////////////////////////////////////////////////////
// Version
////////////////////////////////////////////////////////////

export async function version() {
  const { data } = await API.get(
    "/automl/version"
  );

  return data;
}

////////////////////////////////////////////////////////////
// Information
////////////////////////////////////////////////////////////

export async function information() {
  const { data } = await API.get(
    "/automl/information"
  );

  return data;
}
