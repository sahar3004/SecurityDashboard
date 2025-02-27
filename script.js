const API_URL = "https://script.google.com/macros/s/AKfycbzDPrKyttnabuPxW6z78NzARSQAcqZi2meeujTeCk0_HCZPp2ZLFBXAuKYqKeJ6G-jvXw/exec"; // הכנס את ה-URL החדש של ה-Web App

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); 

    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    console.log("🔍 שם משתמש שהוזן:", `"${user}"`);
    console.log("🔍 סיסמה שהוזנה:", `"${pass}"`);

    const correctUser = "1";
    const correctPass = "1";

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

// שליפת נתונים מהגיליון
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
        createColumnSelectors(result.data[0]); // יצירת אפשרות לבחירת עמודות
    } catch (error) {
        console.error("⚠️ שגיאה בביצוע הבקשה:", error);
        alert("❌ לא ניתן למשוך נתונים, בדוק את החיבור לגוגל שיטס.");
    }
}

// בניית הטבלה עם כל הנתונים
function populateTable(data) {
    let table = document.getElementById("data-table");
    table.innerHTML = ""; 

    if (!data || data.length === 0) {
        table.innerHTML = "<tr><td colspan='5'>❌ לא נמצאו נתונים</td></tr>";
        return;
    }

    console.log("📊 מבנה הנתונים שהתקבלו:", data);

    // יצירת כותרות
    let headers = data[0]; 
    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");

    headers.forEach((header, index) => {
        let th = document.createElement("th");
        th.textContent = header;
        th.dataset.column = index;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    // יצירת שורות הנתונים
    data.slice(1).forEach(row => {
        let tr = document.createElement("tr");

        row.forEach((cell, index) => {
            let td = document.createElement("td");

            // המרת ערכים ספציפיים
            if (cell === "ללא ציון רלוונטי") {
                td.textContent = "";
            } else {
                td.textContent = cell;
            }

            td.dataset.column = index; 
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
}

// יצירת אפשרות לבחירת עמודות לתצוגה
function createColumnSelectors(headers) {
    let columnsContainer = document.getElementById("columns-container");
    columnsContainer.innerHTML = ""; 

    headers.forEach((header, index) => {
        let label = document.createElement("label");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.dataset.column = index;
        checkbox.addEventListener("change", toggleColumnVisibility);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + header));
        columnsContainer.appendChild(label);
    });
}

// הצגת / הסתרת עמודות לפי בחירה
function toggleColumnVisibility(event) {
    let columnIndex = event.target.dataset.column;
    let table = document.getElementById("data-table");
    let rows = table.querySelectorAll("tr");

    rows.forEach(row => {
        let cell = row.cells[columnIndex];
        if (cell) {
            cell.style.display = event.target.checked ? "" : "none";
        }
    });
}

// המרת מספרים וטיפול במידע ריק
function cleanNumber(value) {
    if (value === undefined || value === null || value === "" || isNaN(value)) {
        return 0;
    }
    return Number(value) || value; 
}

// מיון הנתונים בטבלה
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

    tbody.innerHTML = "";
    sortedRows.forEach(row => tbody.appendChild(row));
}
