import express from "express";
import cors from "cors";
import { createRequestHandler } from "@react-router/express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/assets", express.static("build/client/assets", { immutable: true, maxAge: "1y" }));

try {
  const build = await import("../build/server/index.js");
  app.use(createRequestHandler({ build, mode: process.env.NODE_ENV }));
  console.log("React Router handler attached");
} catch {
  console.warn("React Router build not found — Express API routes only. Run 'npm run build' for full production.");
}

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
