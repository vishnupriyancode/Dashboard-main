export const sampleApiLogs = [
  {
    id: 1,
    domain_id: "domain1",
    model: "GPT-4",
    status: "success",
    endpoint: "/api/v1/chat",
    time: "2024-04-08 10:00:00",
    value: "1234567891012",
    method: "POST",
    state: "Completed"
  },
  {
    id: 2,
    domain_id: "domain2",
    model: "GPT-3.5-Turbo",
    status: "error",
    endpoint: "/api/v1/completion",
    time: "2024-04-08 10:05:00",
    value: "1234567891013",
    method: "GET",
    state: "Failed"
  },
  {
    id: 3,
    domain_id: "domain3",
    model: "DALL-E-3",
    status: "success",
    endpoint: "/api/v1/images",
    time: "2024-04-08 10:10:00",
    value: "1234567891014",
    method: "POST",
    state: "Completed"
  },
  {
    id: 4,
    domain_id: "domain1",
    model: "Claude-2",
    status: "success",
    endpoint: "/api/v1/chat",
    time: "2024-04-08 10:15:00",
    value: "1234567891015",
    method: "GET",
    state: "Completed"
  },
  {
    id: 5,
    domain_id: "domain2",
    model: "Stable-Diffusion-XL",
    status: "error",
    endpoint: "/api/v1/images",
    time: "2024-04-08 10:20:00",
    value: "1234567891016",
    method: "POST",
    state: "Failed"
  },
  {
    id: 6,
    domain_id: "domain3",
    model: "Llama-2-70B",
    status: "success",
    endpoint: "/api/v1/completion",
    time: "2024-04-08 10:25:00",
    value: "1234567891017",
    method: "GET",
    state: "Completed"
  },
  {
    id: 7,
    domain_id: "domain1",
    model: "PaLM-2",
    status: "pending",
    endpoint: "/api/v1/chat",
    time: "2024-04-08 10:30:00",
    value: "1234567891018",
    method: "POST",
    state: "In Progress"
  },
  {
    id: 8,
    domain_id: "domain2",
    model: "Gemini-Pro",
    status: "success",
    endpoint: "/api/v1/chat",
    time: "2024-04-08 10:35:00",
    value: "1234567891019",
    method: "GET",
    state: "Completed"
  }
]; 