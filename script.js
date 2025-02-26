const API_URL = "https://script.google.com/macros/s/YOUR_NEW_SCRIPT_ID/exec"; // הכנס את ה-URL החדש

// פונקציה לניהול התחברות
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // מונע רענון של הדף

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    console.log("🟢 ניסיון התחברות עם שם משתמש:", user); // בדיקה אם המשתמש מזין נתונים

    if (user === "management" && pass === "management") {
        console.log("✅ התחברות מוצלחת!");
        document.getElementById("login-container").style.display = "none"; 
        document.getElementById("dashboard").style.display = "block"; 
        fetchData(); // טוען נתונים אוטומטית
    } else {
        console.error("❌ שם משתמש או סיסמה שגויים!");
        alert("❌ שם משתמש או סיסמה שגויים!");
    }
});

// פונקציה לשליפת נתונים מהגיליון
async function fetchData() {
    try {
        console.log("🔄 Fetching data from:", API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result || typeof result !== "object") {
            throw new Error("🔴 הנתונים שהתקבלו אינם תקינים.");
        }

        if (result.error) {
            console.error("❌ שגיאה בקבלת הנתונים:", result.error);
            alert(`❌ שגיאה בקבלת נתונים: ${result.error}`);
            return;
        }

        if (!result.success || !result.data || !Array.isArray(result.data)) {
            alert("❌ הנתונים שהתקבלו לא תקינים!");
            console.error("⚠️ הנתונים שהתקבלו:", result);
            return;
        }

        console.log("✅ Data received successfully:", result.data);
        populateTable(result.data);
    } catch (error) {
        console.error("⚠️ שגיאה בביצוע הבקשה:", error);
        alert("❌ לא ניתן למשוך נתונים, בדוק את החיבור לגוגל שיטס.");
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
