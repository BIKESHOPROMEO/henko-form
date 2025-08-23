document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const selectedDate = params.get("date");
  const selectedTime = params.get("time");

  // 日付を「8/22（金）」形式に変換する関数
  function formatJapaneseDate(dateStr, timeStr) {
    const date = new Date(`${dateStr}T${timeStr}`);
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}（${weekday}） ${timeStr}`;
  }

  // 表示用テキスト更新
  const displayText = (selectedDate && selectedTime)
  ? formatJapaneseDate(selectedDate, selectedTime)
  : "未選択";

  const displayEl = document.getElementById("selectedDateTime");
   displayEl.textContent = displayText;
   displayEl.style.color = "#007BFF";  // Bootstrap風の青色

  // hiddenフィールドに値をセット
  const dateInput = document.querySelector('input[name="date"]');
  const timeInput = document.querySelector('input[name="time"]');
  if (dateInput && timeInput && selectedDate && selectedTime) {
    dateInput.value = selectedDate;
    timeInput.value = selectedTime;
  }
});

document.getElementById("submitBtn").addEventListener("click", async function () {
  this.disabled = true;
  document.getElementById("sendingDialog").style.display = "block";

  const form = document.getElementById("reservationForm");
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  data.action = "create";
  data.selectedDateTime = `${data.date || ""} ${data.time || ""}`;

  try {
    const response = await fetch("/api/yoyaku-form", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});

    const result = await response.json();
    console.log("fetch成功:", result);
    alert(result.message || "予約が送信されました！");
  } catch (err) {
    console.error("fetchエラー:", err);
    alert("エラーが発生しました：" + err.message);
    this.disabled = false;
  } finally {
    document.getElementById("sendingDialog").style.display = "none";
  }
});