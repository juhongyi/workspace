const API = "https://discord.com/api/v10"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const Discord = async ({ client }) => {
  const token = process.env.OPENCODE_DISCORD_BOT_TOKEN
  if (!token) return {}

  let dmChannelId = null

  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
    return response
  }

  const retryable = (status) => status === 429 || status >= 500

  const send = async (path, body) => {
    let attempt = 0
    while (true) {
      attempt += 1
      try {
        const response = await request(path, {
          method: "POST",
          body: JSON.stringify(body),
        })
        if (response.ok) return
        if (!retryable(response.status) || attempt > 3) {
          await client.app.log({
            body: {
              service: "discord-notify",
              level: "error",
              message: `Discord request failed with status ${response.status}`,
            },
          })
          return
        }
        const retryAfter = Number(response.headers.get("Retry-After"))
        const delay = Number.isFinite(retryAfter)
          ? retryAfter * 1000
          : 2 ** attempt * 1000
        await sleep(delay)
      } catch (error) {
        if (attempt > 3) {
          await client.app.log({
            body: {
              service: "discord-notify",
              level: "error",
              message: "Discord request failed",
            },
          })
          return
        }
        await sleep(2 ** attempt * 1000)
      }
    }
  }

  const ensureChannel = async () => {
    if (dmChannelId) return dmChannelId

    const appResponse = await request("/oauth2/applications/@me")
    if (!appResponse.ok) return null
    const app = await appResponse.json()
    const recipientId = app.owner?.id
    if (!recipientId) return null

    const channelResponse = await request("/users/@me/channels", {
      method: "POST",
      body: JSON.stringify({ recipient_id: recipientId }),
    })
    if (!channelResponse.ok) return null
    const channel = await channelResponse.json()
    dmChannelId = channel.id
    return dmChannelId
  }

  const notify = async (title, body) => {
    const channelId = await ensureChannel()
    if (!channelId) return
    await send(`/channels/${channelId}/messages`, {
      content: `**${title}**\n${body}`,
    })
  }

  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool !== "question") return

      const body =
        output.args.questions?.map((q) => q.question).join("\n") ||
        "Question needs input"

      await notify("OpenCode | Question", body)
    },
    event: async ({ event }) => {
      if (event.type === "permission.asked") {
        await notify("OpenCode | Request", event.properties.permission)
      }
      if (
        event.type === "session.status" &&
        event.properties.status.type === "idle"
      ) {
        const { data: session } = await client.session.get({
          path: { id: event.properties.sessionID },
        })

        if (session?.parentID) return

        await notify("OpenCode | Done", "Task complete")
      }
    },
  }
}
