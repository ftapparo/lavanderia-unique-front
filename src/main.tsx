import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import { APP_DESCRIPTION, APP_NAME } from "@/config/app-config";
import { queryClient } from "@/lib/query-client";
import { redirectToMobileAppIfNeeded } from "@/utils/cross-app-redirect";

document.title = APP_NAME;
const descriptionMeta = document.querySelector("meta[name='description']");
if (descriptionMeta) {
  descriptionMeta.setAttribute("content", APP_DESCRIPTION);
}

if (!redirectToMobileAppIfNeeded()) {
  registerSW({ immediate: true });

  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
}
