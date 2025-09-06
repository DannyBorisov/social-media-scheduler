import express from "express";
import cors from "cors";
import routes from "./routes";

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());

export function start() {
  app.use("/", routes);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
