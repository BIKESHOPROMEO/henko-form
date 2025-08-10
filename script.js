// URLパラメータから選択された日時を取得
const params = new URLSearchParams(window.location.search);
const selectedDate = params.get("date");
const selectedTime = params.get("time");

if (selectedDate && selectedTime) {
  document.getElementById("selectedDateTime").textContent = `${selectedDate} ${selectedTime}`;
}

// 送信ボタンのクリック処理
document.getElementById("submitBtn").addEventListener("click", function() {
  // 送信ボタンを無効化（連打防止）
  this.disabled = true;

  // 送信中ダイアログ表示
  document.getElementById("sendingDialog").style.display = "block";

  const form = document.getElementById("reservationForm");
  const formData = new FormData(form);
  const data = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    data.append(key, value);
  }

  data.append("selectedDateTime", `${selectedDate} ${selectedTime}`);

  fetch("https://script.google.com/macros/s/AKfycbyE1-J7AqYT9v5SwHZtcC-SjH73CI11KG8jR0dES6fOkEMnZhvsx9gMplEHatxVNRaFaw/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: data.toString()
  })
  .then(res => {
    document.getElementById("sendingDialog").style.display = "none";

    if (res.ok) {
      alert("予約を送信しました！");
      // 必要ならここで画面遷移なども可能
    } else {
      this.disabled = false;
      alert("送信に失敗しました");
    }
  })
  .catch(err => {
    document.getElementById("sendingDialog").style.display = "none";
    this.disabled = false;
    alert("エラーが発生しました");
  });
});