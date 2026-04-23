export default async function handler(req, res) {
  try {
    const jsonUrl = `${req.headers.host.includes("localhost") ? "http" : "https"}://${req.headers.host}/playlist.json`;

    const response = await fetch(jsonUrl);
    const data = await response.json();

    let m3u = "#EXTM3U\n";

    data.channels.forEach(ch => {
      const proxy = `/api/proxy?url=${encodeURIComponent(ch.url)}`;

      m3u += `#EXTINF:-1 tvg-name="${ch.name}" tvg-logo="${ch.logo}" group-title="${ch.group}",${ch.name}\n`;
      m3u += `${proxy}\n`;
    });

    res.setHeader("Content-Type", "application/x-mpegURL");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");

    return res.send(m3u);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
