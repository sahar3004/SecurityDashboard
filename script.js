const API_URL = "https://script.google.com/macros/s/AKfycbwV9svrzhDyvv79aS9JTH4waaYSP4mDnzS6q-Pho4MMXqz5_d_SJ8OLijGuXYFsAXA6/exec"; // החלף בכתובת ה-Web App שלך
// משתנים לניהול התחברות
const USERNAME = "1";
const PASSWORD = "1";

// פונקציה לניהול התחברות
function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;
    if (user === USERNAME && pass === PASSWORD) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        fetchData(); // משיכת נתונים אוטומטית לאחר התחברות
    } else {
        alert("❌ שם משתמש או סיסמה שגויים!");
    }
}

// פונקציה לשליפת נתונים מהגיליון
async function fetchData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    
    if (data.success) {
      console.log("✅ Data received:", data.data);
      populateTable(data.data); // עדכון הטבלה עם הנתונים
    } else {
      console.error("Error:", data.error);
      alert(`❌ שגיאה בקבלת נתונים: ${data.error}`);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("❌ לא ניתן להתחבר לשרת, בדוק את החיבור שלך.");
  }
}

// פונקציה להצגת הנתונים בטבלה
function populateTable(data) {
    let table = document.getElementById("data-table");
    table.innerHTML = ""; // ניקוי הטבלה לפני הכנסת נתונים

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='5'>❌ לא נמצאו נתונים</td></tr>";
        return;
    }

    data.forEach(row => {
        let tr = document.createElement("tr");
        row.forEach(cell => {
            let td = document.createElement("td");
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}

// פונקציה לרענון נתונים
document.getElementById("refresh-btn").addEventListener("click", () => fetchData());

// התחברות למערכת
document.getElementById("login-btn").addEventListener("click", login);