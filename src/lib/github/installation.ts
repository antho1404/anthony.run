import { addInstallation, removeInstallation } from "@/lib/github";
import { Event } from "@/lib/github/type";

export function handleInstallationEvent(
  payload: Event<"installation-created" | "installation-deleted">
) {
  if (payload.action === "created")
    return addInstallation(payload.sender.id, payload.installation.id);
  if (payload.action === "deleted")
    return removeInstallation(payload.sender.id, payload.installation.id);
}
