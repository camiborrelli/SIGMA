import axios from "axios";

const API_URL =
  "https://sigma-backend-jp8vvxiej-camilas-projects-2b00654e.vercel.app";
export default axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export { API_URL };
