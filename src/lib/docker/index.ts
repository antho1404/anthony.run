import https from "https";
import fetch from "node-fetch";

const dockerUrl = `https://${process.env.DOCKER_HOST}:2376`;

const agent = () =>
  new https.Agent({
    ca: Buffer.from(process.env.DOCKER_CA || "", "base64").toString("utf-8"),
    cert: Buffer.from(process.env.DOCKER_CERT || "", "base64").toString(
      "utf-8"
    ),
    key: Buffer.from(process.env.DOCKER_KEY || "", "base64").toString("utf-8"),
    rejectUnauthorized: true, // ensure CA validation
  });

export async function createContainer(opts: {
  image: string;
  name: string;
  cmd: string[];
  env: string[];
}) {
  const response = await fetch(
    `${dockerUrl}/containers/create?name=${opts.name}`,
    {
      agent: agent(),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Image: opts.image,
        Env: opts.env,
        Cmd: opts.cmd,
        HostConfig: {
          // AutoRemove: true,
          RestartPolicy: {
            Name: "no",
          },
        },
      }),
    }
  );
  const data = (await response.json()) as { message: string } | { Id: string };
  if ("message" in data) throw new Error(data.message);
  if (!response.ok) throw new Error("Unknown error");
  return data.Id;
}

export async function startContainer(id: string) {
  const response = await fetch(`${dockerUrl}/containers/${id}/start`, {
    agent: agent(),
    method: "POST",
  });
  const data = (await response.json()) as { message: string } | object;
  if ("message" in data) throw new Error(data.message);
  if (!response.ok) throw new Error("Unknown error");
  return id;
}
