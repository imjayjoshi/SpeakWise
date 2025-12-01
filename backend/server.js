require("dotenv").config();
const app = require("../backend/src/app");
const connectDB = require("../backend/src/db/db");

connectDB();
app.listen(process.env.PORT || 5000, "0.0.0.0", () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
