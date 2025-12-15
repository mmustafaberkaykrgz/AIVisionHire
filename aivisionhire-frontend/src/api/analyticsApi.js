// src/api/analyticsApi.js
import axiosClient from "./axiosClient";

const analyticsApi = {
  getDashboardStats: () => axiosClient.get("/analytics/dashboard"),
};

export default analyticsApi;
