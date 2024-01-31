import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRouter from "./routes/auth";
import taskRouter from "./routes/task";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/ping", (_req, res) => {
  console.log("someone ping here!!");
  res.send("pong");
});

app.use("/auth", authRouter);
app.use("/api/task", taskRouter);

app.listen(PORT, () => {
  console.log(`Server running in ${PORT}`);
});
