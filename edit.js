const params = new URLSearchParams(location.search);
const id = params.get("id");
let selectedDateTime = "";

async function fetchReservationData() {
  const endpoint = `https://script.google.com/macros/s/AKfycbyE1-J7AqYT9v5SwHZtcC-SjH73CI11KG8jR0dES6fOkEMnZhvsx9gMplEHatxVNRaFaw/exec?action=get&id=${id}`;
  try {
    const res = await fetch(endpoint);
    const data = await res.json();

    if (data.error) {
      alert("予約情報が見つかりませんでした");
      return;
    }

    document.querySelector("input[name='name']").value = data.name;
    document.querySelector("input[name='phone']").value = data.phone.replace(/^'/, "");
    document.querySelector("input[name='email']").value = data.email;
    document.querySelector("input[name='carModel']").value = data.carModel;
    document.querySelector("select[name='workType']").value = data.workType;
    document.querySelector("textarea[name='note']").value = data.note;

    selectedDateTime = `${data.date} ${formatTime(data.time)}`;
    document.getElementById("selectedDateTime").textContent = selectedDateTime;
  } catch (err) {
    console.error("取得失敗:", err);
    alert("データ取得に失敗しました");
  }
}

function formatTime(timeStr) {
  const t = new Date(`1970-01-01T${timeStr}:00`);
  return `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
}

document.getElementById("changeDateBtn").addEventListener("click", () => {
  window.location.href = `calendar.html?id=${id}`;
});

document.getElementById("submitBtn").addEventListener("click", async function () {
  this.disabled = true;
  document.getElementById("sendingDialog").style.display = "block";

  const form = document.getElementById("reservationForm");
  const formData = new FormData(form);
  const data = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    data.append(key, value);
  }

  data.append("action", "update");
  data.append("id", id);
  data.append("selectedDateTime", selectedDateTime);

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbyE1-J7AqYT9v5SwHZtcC-SjH73CI11KG8jR0dES6fOkEMnZhvsx9gMplEHatxVNRaFaw/exec", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data.toString()
    });

    document.getElementById("sendingDialog").style.display = "none";

    if (res.ok) {
      alert("予約内容を変更しました！");
    } else {
      this.disabled = false;
      alert("変更に失敗しました");
    }
  } catch (err) {
    document.getElementById("sendingDialog").style.display = "none";
    this.disabled = false;
    alert("エラーが発生しました");
  }
});

fetchReservationData();