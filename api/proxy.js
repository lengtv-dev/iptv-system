export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    // 🎯 กำหนด Referer ตายตัว
    const headers = {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://warpdooball.net/",
      "Origin": "https://warpdooball.net"
    };

    const response = await fetch(target, { headers });

    const contentType = response.headers.get("content-type") || "";

    // 🔥 ถ้าเป็น m3u8 → rewrite
    if (contentType.includes("mpegurl")) {
      let body = await response.text();
      const base = target.substring(0, target.lastIndexOf("/") + 1);

      body = body.split("\n").map(line => {
        if (line.startsWith("#") || line.trim() === "") return line;

        let url = line;
        if (!line.startsWith("http")) url = base + line;

        // ยิงผ่าน proxy พร้อม referer
        return `/api/proxy?url=${encodeURIComponent(url)}`;
      }).join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(body);
    }

    // 🎬 segment (.ts / .mp4)
    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.send(Buffer.from(buffer));

  } catch (err) {
    return res.status(500).json({
      error: "Proxy error",
      detail: err.message
    });
  }
}
