import dotenv from "dotenv";
import app from "./app";

dotenv.config();
// //console.log("CLERK_SECRET_KEY exists:", !!process.env.CLERK_SECRET_KEY);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});