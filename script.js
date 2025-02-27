const API_URL = "https://script.google.com/macros/s/AKfycbzDPrKyttnabuPxW6z78NzARSQAcqZi2meeujTeCk0_HCZPp2ZLFBXAuKYqKeJ6G-jvXw/exec"; // הכנס את ה-URL החדש של ה-Web App

// פונקציה לניהול התחברות
document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // מונע רענון של הדף

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    console.log("🔍 שם משתמש שהוזן:", `"${user}"`);
    console.log("🔍 סיסמה שהוזנה:", `"${pass}"`);

    const correctUser = "management";
    const correctPass = "management";

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

        console.log("✅ נתונים נטענו בהצלחה:", result.data);
        populateTable(result.data);
    } catch (error) {
        console.error("⚠️ שגיאה בביצוע הבקשה:", error);
        alert("❌ לא ניתן למשוך נתונים, בדוק את החיבור לגוגל שיטס.");
    }
}

// פונקציה לבניית הטבלה עם טיפול מתקדם בנתונים
function populateTable(data) {
    let table = document.getElementById("data-table");
    table.innerHTML = ""; // ניקוי הטבלה לפני הכנסת נתונים

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='5'>❌ לא נמצאו נתונים</td></tr>";
        return;
    }

    // יצירת כותרות עם אפשרות למיון
    let headers = ["שם מאבטח", "איחורים", "תקלות משמעת", "הצלחות מבצעיות", "תקלות מבצעיות"];
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    headers.forEach((header, index) => {
        let th = document.createElement("th");
        th.textContent = header;
        th.style.cursor = "pointer";
        th.onclick = () => sortTable(index);
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // יצירת גוף הטבלה
    let tbody = document.createElement("tbody");

    data.forEach(row => {
        let tr = document.createElement("tr");

        let name = row[0] ? row[0] : "לא ידוע"; // שם המאבטח
        let late = cleanNumber(row[1]); // טיפול מתקדם במספרים
        let discipline = cleanNumber(row[2]);
        let success = cleanNumber(row[3]);
        let failure = cleanNumber(row[4]);

        console.log(`📊 נתונים לפני הכנסת שורה:`, { name, late, discipline, success, failure });

        // הוספת עיצוב לפי נתונים
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

// פונקציה לניקוי והמרת מספרים
function cleanNumber(value) {
    if (value === undefined || value === null || value === "" || isNaN(value)) {
        return 0; // אם הערך ריק או לא מספרי, החזר 0
    }
    return parseInt(value) || 0; // אם הערך תקין, המרה למספר שלם
}

// פונקציה למיון הנתונים בטבלה
function sortTable(columnIndex) {
    let table = document.getElementById("data-table");
    let tbody = table.querySelector("tbody");
    let rows = Array.from(tbody.querySelectorAll("tr"));

    let isNumeric = !isNaN(rows[0].cells[columnIndex].textContent.trim());

    let sortedRows = rows.sort((a, b) => {
        let aValue = a.cells[columnIndex].textContent.trim();
        let bValue = b.cells[columnIndex].textContent.trim();

        if (isNumeric) {
            return Number(aValue) - Number(bValue);
        } else {
            return aValue.localeCompare(bValue, 'he');
        }
    });

    tbody.innerHTML = ""; // ניקוי הנתונים הקודמים
    sortedRows.forEach(row => tbody.appendChild(row));
}
