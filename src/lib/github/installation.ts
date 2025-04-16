import { addInstallation, removeInstallation } from "@/lib/github";
import { Event } from "@/lib/github/type";

export async function handleInstallationEvent(
  payload: Event<"installation-created" | "installation-deleted">
) {
  if (payload.action === "created")
    return await addInstallation(payload.sender.id, payload.installation.id);
  if (payload.action === "deleted")
    return await removeInstallation(payload.sender.id, payload.installation.id);
}
