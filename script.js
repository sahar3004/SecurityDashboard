const API_URL = "https://script.google.com/macros/s/AKfycbzDPrKyttnabuPxW6z78NzARSQAcqZi2meeujTeCk0_HCZPp2ZLFBXAuKYqKeJ6G-jvXw/exec"; // הכנס את ה-URL החדש

// פונקציה לניהול התחברות
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // מונע רענון של הדף

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    console.log("🔍 שם משתמש שהוזן:", `"${user}"`); // הצגת שם המשתמש בקונסול
    console.log("🔍 סיסמה שהוזנה:", `"${pass}"`); // הצגת סיסמה בקונסול

    const correctUser = "management";
    const correctPass = "management";

    console.log("✔️ שם משתמש נכון:", `"${correctUser}"`);
    console.log("✔️ סיסמה נכונה:", `"${correctPass}"`);

    if (user === correctUser && pass === correctPass) {
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

    // הוספת כותרות עם אפשרות למיון
    let headers = ["שם מאבטח", "איחורים", "תקלות משמעת", "הצלחות מבצעיות", "תקלות מבצעיות"];
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    headers.forEach((header, index) => {
        let th = document.createElement("th");
        th.textContent = header;
        th.onclick = () => sortTable(index);
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // הוספת הנתונים לטבלה
    let tbody = document.createElement("tbody");

    data.forEach(row => {
        let tr = document.createElement("tr");

        let name = row[0] || "לא ידוע"; // שם המאבטח
        let late = isNaN(row[1]) ? 0 : parseInt(row[1]); // איחורים
        let discipline = isNaN(row[2]) ? 0 : parseInt(row[2]); // תקלות משמעת
        let success = isNaN(row[3]) ? 0 : parseInt(row[3]); // הצלחות מבצעיות
        let failure = isNaN(row[4]) ? 0 : parseInt(row[4]); // תקלות מבצעיות

        // הוספת עיצוב מותאם לנתונים
        if (failure >= 3) {
            tr.classList.add("danger"); // רקע אדום לתקלות חמורות
        } else if (discipline >= 2) {
            tr.classList.add("warning"); // רקע צהוב לתקלות משמעת קלות
        } else if (success >= 3) {
            tr.classList.add("success"); // רקע ירוק להצלחות
        }

        [name, late, discipline, success, failure].forEach(cellData => {
            let td = document.createElement("td");
            td.textContent = cellData;
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

// פונקציה לרענון נתונים
document.getElementById("refresh-btn").addEventListener("click", () => fetchData());

function sortTable(columnIndex) {
    let table = document.getElementById("data-table");
    let rows = Array.from(table.querySelectorAll("tbody tr"));

    let sortedRows = rows.sort((a, b) => {
        let aValue = a.cells[columnIndex].textContent.trim();
        let bValue = b.cells[columnIndex].textContent.trim();

        return isNaN(aValue) ? aValue.localeCompare(bValue) : aValue - bValue;
    });

    let tbody = table.querySelector("tbody");
    tbody.innerHTML = ""; // ניקוי הנתונים הקודמים

    sortedRows.forEach(row => tbody.appendChild(row));
}
