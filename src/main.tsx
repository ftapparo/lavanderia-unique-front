import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { APP_DESCRIPTION, APP_NAME } from "@/config/app-config";

document.title = APP_NAME;
const descriptionMeta = document.querySelector("meta[name='description']");
if (descriptionMeta) {
  descriptionMeta.setAttribute("content", APP_DESCRIPTION);
}

registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(<App />);
