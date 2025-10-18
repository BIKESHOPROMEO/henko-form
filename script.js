document.addEventListener("DOMContentLoaded", () => {
const loadingOverlay = document.getElementById("loadingOverlay");
loadingOverlay.style.display = "block"; // ← fetch前に表示
  document.getElementById("closeDialogBtn").addEventListener("click", () => {
      document.getElementById("closeDialog").style.display = "none";
  });

  const params = new URLSearchParams(window.location.search);  
  let selectedDate = params.get("date");
  let selectedTime = params.get("time");
  const id = params.get("id");
  let originalDate = params.get("originalDate");
  let originalTime = params.get("originalTime");

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
  fetch(`/api/henko-form?id=${id}&action=getReservation`)
    .then(res => res.json())
    .then(data => {
  if (data && data.id) {
        selectedDate = selectedDate || data.date;
        selectedTime = selectedTime || data.time;

    // フォームに反映
        document.querySelector('input[name="name"]').value = data.name || "";
        document.querySelector('input[name="phone"]').value = data.phone || "";
        document.querySelector('input[name="email"]').value = data.email || "";
        document.querySelector('input[name="carModel"]').value = data.carModel || "";
        document.querySelector('select[name="workType"]').value = data.workType || "";
        document.querySelector('textarea[name="note"]').value = data.note || "";

        // hiddenフィールド（IDは常にセット）
        document.querySelector('input[name="id"]').value = id || "";

        let originalDisplayText = "";
          if (!originalDate && data.date) originalDate = data.date;
          if (!originalTime && data.time) originalTime = data.time;

          if (originalDate && originalTime) {
            originalDisplayText = formatJapaneseDate(originalDate, originalTime);
          }
                  
        document.getElementById("originalDateTime").textContent = originalDisplayText;      

        if (selectedDate && selectedTime) {
          const newDisplayText = formatJapaneseDate(selectedDate, selectedTime);
          document.getElementById("selectedDateTime").textContent = newDisplayText;
          document.getElementById("selectedDateTime").style.color = "#007BFF";
          document.querySelector('input[name="date"]').value = selectedDate;
          document.querySelector('input[name="time"]').value = selectedTime;
        } else {
          document.getElementById("selectedDateTime").textContent = originalDisplayText;
          document.getElementById("selectedDateTime").style.color = "#007BFF";
          document.querySelector('input[name="date"]').value = data.date || "";
          document.querySelector('input[name="time"]').value = data.time || "";
        }
      } else {
        alert("予約情報の取得に失敗しました");
      }
    })
    .catch(err => {
      console.error("予約情報取得エラー:", err);
      alert("予約情報の取得に失敗しました");
    })
    .finally(() => {
      loadingOverlay.style.display = "none";
    });
}
  // 日時変更ボタンの動作
  document.getElementById("changeDateBtn").addEventListener("click", () => {
  if (id) {
    const url = new URL("https://henko-calendar.vercel.app/");
    url.searchParams.set("id", id); // ← 予約ID
    url.searchParams.set("originalDate", selectedDate); // ← 元の予約日
    url.searchParams.set("originalTime", selectedTime); // ← 元の予約時間
    window.location.href = url.toString();
  } else {
    alert("予約IDが取得できませんでした。");
  }
});

	document.getElementById("cancelBtn").addEventListener("click", async function () {
  if (!id) {
    alert("予約IDが取得できませんでした。");
    return;
  }

  const confirmCancel = confirm("本当に予約をキャンセルしますか？");
  if (!confirmCancel) return;

  this.disabled = true;
  document.getElementById("sendingDialog").style.display = "block";

  const form = document.getElementById("reservationForm");
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    data[key] = value;
  }

  data.action = "cancel";

  try {
    const response = await fetch("/api/henko-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log("キャンセル成功:", result);
    alert(result.message || "予約をキャンセルしました！");
    window.location.href = "https://lin.ee/Z2vIdYk"; // ← 任意の完了画面へ
  } catch (err) {
    console.error("キャンセルエラー:", err);
    alert("キャンセル処理中にエラーが発生しました：" + err.message);
    this.disabled = false;
  } finally {
    document.getElementById("sendingDialog").style.display = "none";
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
      // ✅ 閉じる案内ダイアログを表示
      document.getElementById("closeDialog").style.display = "block";      
      this.textContent = "送信完了！"; // ← ボタンのラベル変更
      this.classList.add("submitted"); // ← CSSで見た目変える用
    } catch (err) {
      console.error("fetchエラー:", err);
      alert("エラーが発生しました：" + err.message);
      this.disabled = false;
    } finally {
  document.getElementById("sendingDialog").style.display = "none";
}
  });
 });