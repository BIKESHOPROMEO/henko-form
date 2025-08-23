document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const selectedDate = params.get("date");
  const selectedTime = params.get("time");
  const id = params.get("id");

  // 日付表示整形
function formatJapaneseDate(dateStr, rawTimeStr) {
  let timeStr = rawTimeStr;

  // もし timeStr が Date型っぽかったら、文字列に変換
  if (typeof rawTimeStr === "string" && rawTimeStr.includes("T")) {
    const timeObj = new Date(rawTimeStr);
    timeStr = timeObj.getHours().toString().padStart(2, "0") + ":" + timeObj.getMinutes().toString().padStart(2, "0");
  }

  const date = new Date(dateStr);
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = weekdays[date.getDay()];
  return `${month}/${day}（${weekday}） ${timeStr}`;
}

if (id) {
  fetch(`https://script.google.com/macros/s/AKfycbyDMFIYDqB_oE6Dybo9wH1LpePIMPwjjcPjmcAuEps32T344pTdETiyjlKA6Sb5YEDaEQ/exec?id=${id}`)
    .then(res => res.json())
    .then(data => {
      if (data && data.id) {
        document.querySelector('input[name="name"]').value = data.name || "";
        document.querySelector('input[name="phone"]').value = data.phone || "";
        document.querySelector('input[name="email"]').value = data.email || "";
        document.querySelector('input[name="carModel"]').value = data.carModel || "";
        document.querySelector('select[name="workType"]').value = data.workType || "";
        document.querySelector('textarea[name="note"]').value = data.note || "";
        document.querySelector('input[name="date"]').value = data.date || "";
        document.querySelector('input[name="time"]').value = data.time || "";

        // 表示用テキスト更新
        const displayText = formatJapaneseDate(data.date, data.time);
        document.getElementById("selectedDateTime").textContent = displayText;
      } else {
        alert("予約情報の取得に失敗しました");
      }
    })
    .catch(err => {
      console.error("予約情報取得エラー:", err);
      alert("予約情報の取得に失敗しました");
    });
}

  document.getElementById("selectedDateTime").style.color = "#007BFF";

  // hiddenフィールドに値をセット
  document.querySelector('input[name="date"]').value = selectedDate || "";
  document.querySelector('input[name="time"]').value = selectedTime || "";
  document.querySelector('input[name="id"]').value = id || "";

  // 日時変更ボタンの動作
  document.getElementById("changeDateBtn").addEventListener("click", () => {
    if (id) {
      window.location.href = `https://bikeshopromeo.github.io/reservation-edit/?id=${id}`;
    } else {
      alert("予約IDが取得できませんでした。");
    }
  });

  // 送信処理
  document.getElementById("submitBtn").addEventListener("click", async function () {
    this.disabled = true;
    document.getElementById("sendingDialog").style.display = "block";

    const form = document.getElementById("reservationForm");
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    data.action = "update"; // ← 変更処理として識別
    data.selectedDateTime = `${data.date || ""} ${data.time || ""}`;

    try {
      const response = await fetch("/api/henko-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("fetch成功:", result);
      alert(result.message || "予約内容を変更しました！");
    } catch (err) {
      console.error("fetchエラー:", err);
      alert("エラーが発生しました：" + err.message);
      this.disabled = false;
    } finally {
      document.getElementById("sendingDialog").style.display = "none";
    }
  });
});