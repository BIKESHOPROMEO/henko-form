export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(req.body)) {
    params.append(key, value);
  }

  try {
    const gasRes = await fetch("https://script.google.com/macros/s/AKfycbyDMFIYDqB_oE6Dybo9wH1LpePIMPwjjcPjmcAuEps32T344pTdETiyjlKA6Sb5YEDaEQ/exec", {
      method: "POST",
      body: params,
    });

    const result = await gasRes.json(); // ← GASのJSONレスポンスを受け取る
    res.status(200).json(result); // ← そのままフロントに返す
  } catch (error) {
    console.error("GAS送信エラー:", error);
    res.status(500).json({ message: "送信に失敗しました。" });
  }
}