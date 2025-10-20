export default async function handler(req, res) {
  const GAS_BASE_URL = "https://script.google.com/macros/s/AKfycbw0xAlekbbME08YaiMQMMB5ngfCDaMEWXicbyU1VlFl8quo1srYmibMD6BPWjdzj_Tb7g/exec";

  if (req.method === "GET") {
  const { id } = req.query;
  const GAS_URL = `${GAS_BASE_URL}?id=${id}&action=getReservation`;

  try {
    const response = await fetch(GAS_URL);
    const text = await response.text();
    const result = JSON.parse(text);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "取得エラー", error: err.message });
  }
}

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const data = req.body;

  try {
    const gasRes = await fetch(GAS_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await gasRes.text();
    console.log("GASレスポンス:", text);

    try {
      const result = JSON.parse(text);
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({
        message: "GASからのレスポンスがJSONではありません",
        raw: text,
      });
    }
  } catch (err) {
    console.error("Vercel Functionsエラー:", err);
    return res.status(500).json({ message: "Vercel Functionsエラー", error: err.message });
  }
}