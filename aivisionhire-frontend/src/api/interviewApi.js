// src/api/interviewApi.js
import axiosClient from "./axiosClient";

const interviewApi = {
  startInterview: (payload) => axiosClient.post("/interview/start", payload),
  submitInterview: (payload) => axiosClient.post("/interview/submit", payload),
  getMyInterviews: () => axiosClient.get("/interview/my-interviews"),
  getInterviewById: (id) => axiosClient.get(`/interview/${id}`),

  // Exit / Abandon
  abandonInterview: (id) => axiosClient.patch(`/interview/${id}/abandon`),
};

export default interviewApi;

