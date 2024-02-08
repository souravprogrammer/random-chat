import dotenv from "dotenv";
dotenv.config();
export default {
  DB_URL: process.env.DB_URL,
  PORT: process.env.PORT || 8000,
};
