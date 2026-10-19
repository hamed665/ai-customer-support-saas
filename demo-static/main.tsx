import { createRoot } from "react-dom/client";
import { SupportWorkspace } from "../app/support-demo/workspace";
import "./reset.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Support workspace root is missing");
}
createRoot(root).render(<SupportWorkspace />);
