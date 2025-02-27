const API_URL = "https://script.google.com/macros/s/AKfycbzDPrKyttnabuPxW6z78NzARSQAcqZi2meeujTeCk0_HCZPp2ZLFBXAuKYqKeJ6G-jvXw/exec"; // הכנס את ה-URL החדש של ה-Web App

let removedSecurityRows = {};

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

// אובייקט לאחסון שורות המאבטחים שהוסרו מהטבלה, key: שם המאבטח, value: השורה (element)
let removedSecurityRows = {};

// שליפת נתונים מהגיליון
async function fetchData() {
    try {
        console.log("🔄 Fetching data...");
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
        if (result.data && result.data.length > 0) {
    createColumnSelectors(result.data[0]);
}
        populateTable(result.data);
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
    
    if (index === 0) {
        // צור label המכיל תיבת סימון ושם המאבטח
        let label = document.createElement("label");
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.whiteSpace = "nowrap";
        
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true; // כברירת מחדל – המאבטח נמצא בטבלה
        checkbox.dataset.security = cell;
        
        // מאזין לשינוי הסימון
        checkbox.addEventListener("change", function() {
            if (!this.checked) {
                // הסתר את השורה מהטבלה
                tr.style.display = "none";
                // הוסף את השורה למערך (האובייקט) של המאבטחים שהוסרו
                removedSecurityRows[cell] = tr;
                // עדכן את רשימת "המאבטחים שהוסרו"
                updateRemovedSecurityList();
            }
        });
        
        let textSpan = document.createElement("span");
        textSpan.textContent = cell;
        textSpan.style.marginLeft = "5px";
        
        label.appendChild(checkbox);
        label.appendChild(textSpan);
        td.appendChild(label);
    } else {
        // עיבוד תאים רגיל
        td.textContent = (cell === "ללא ציון רלוונטי") ? "" : cell;
    }
    
    td.dataset.column = index;
    tr.appendChild(td);
});


// יצירת אפשרות לבחירת עמודות לתצוגה
function createColumnSelectors(headers) {
    let columnsContainer = document.getElementById("column-container");
    columnsContainer.innerHTML = ""; 

  headers.forEach((header, index) => {
    let label = document.createElement("label");
    // עדכון: אין יותר הגדרת רוחב קבוע אלא ננצל את הגריד של הקונטיינר
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.whiteSpace = "nowrap"; // מונע שבירת שורה בתוך ה-label
    // ניתן להוסיף מרווח בין הטקסט לתיבת הסימון
    
    let textSpan = document.createElement("span");
    textSpan.textContent = header;
    textSpan.style.marginLeft = "5px"; // ריווח קל בין תיבת הסימון לטקסט

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.dataset.column = index;
    checkbox.addEventListener("change", toggleColumnVisibility);

    // הוסף את תיבת הסימון ואז את הטקסט – או להפך, לפי העדפתך.
    // כאן נניח שתרצה שהתיבה תהיה משמאל לטקסט:
    label.appendChild(checkbox);
    label.appendChild(textSpan);

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

// יצירת אפשרות לבחירת מאבטחים
function createSecuritySelectors(names) {
    let container = document.getElementById("security-list");
    let searchInput = document.getElementById("security-search");
    let selectAllCheckbox = document.getElementById("select-all-security");

    container.innerHTML = ""; // מנקה את הרשימה
    container.style.display = "none"; // הרשימה מוסתרת כברירת מחדל

    let allSecurity = names.map(name => ({
        name,
        checkbox: createSecurityCheckbox(name)
    }));

    // חיפוש מאבטחים - יציג את הרשימה רק לאחר הקלדה
    searchInput.addEventListener("input", function () {
        let searchValue = this.value.toLowerCase();
        container.innerHTML = ""; // מנקה תוצאות ישנות
        container.style.display = searchValue ? "block" : "none"; // מציג תוצאות רק אם יש חיפוש

        allSecurity
            .filter(({ name }) => name.toLowerCase().includes(searchValue))
            .forEach(({ checkbox }) => container.appendChild(checkbox));
    });

    // בחר הכל
    selectAllCheckbox.addEventListener("change", function () {
        let checkboxes = container.querySelectorAll("input[type='checkbox']");
        let isChecked = this.checked;

        checkboxes.forEach(cb => cb.checked = isChecked);
        filterSecurityView();
    });

    function createSecurityCheckbox(name) {
        let label = document.createElement("label");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        checkbox.dataset.security = name;
        checkbox.addEventListener("change", () => {
            if (!checkbox.checked) selectAllCheckbox.checked = false;
            filterSecurityView();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + name));
        return label;
    }
}

// הצגת / הסתרת מאבטחים לפי בחירה
function filterSecurityView() {
    let table = document.getElementById("data-table");
    let checkboxes = document.querySelectorAll("#security-list input[type='checkbox']");
    let selectedSecurity = new Set([...checkboxes].filter(cb => cb.checked).map(cb => cb.dataset.security));

    let rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
        let name = row.cells[0]?.textContent.trim();
        row.style.display = selectedSecurity.has(name) ? "" : "none";
    });

    // אם כל המאבטחים מסומנים, הפעל מחדש את "בחר הכל"
    let allChecked = [...checkboxes].every(cb => cb.checked);
    document.getElementById("select-all-security").checked = allChecked;
}

// פונקציה לפתיחת/סגירת תפריטים + עדכון החצים 🔽/🔼
function toggleDropdown(dropdownId, arrowId) {
    let dropdown = document.getElementById(dropdownId);
    let arrow = document.getElementById(arrowId);
    
    let computedDisplay = window.getComputedStyle(dropdown).display;
    // עבור "column-container" תשתמש ב-"flex" כמצב פתוח
    let isOpen = (dropdownId === "column-container") ? (computedDisplay === "flex") : (computedDisplay !== "none");

    if (dropdownId === "column-container") {
    dropdown.style.display = isOpen ? "none" : "flex";
} else {
    dropdown.style.display = isOpen ? "none" : "block";
}
    arrow.textContent = isOpen ? "🔽" : "🔼";
}

// פתיחת/סגירת "בחר עמודות"
document.getElementById("toggle-columns").addEventListener("click", function () {
    toggleDropdown("column-container", "columns-arrow");
});

document.getElementById("toggle-security").addEventListener("click", function () {
    toggleDropdown("security-container", "security-arrow");
});

// שינוי מנוע החיפוש – הצגת מאבטחים רק לאחר הקלדה
document.getElementById("security-search").addEventListener("input", function () {
    let searchValue = this.value.toLowerCase();
    let container = document.getElementById("security-list");
    container.style.display = searchValue ? "block" : "none"; // לא פותח תפריטים
});

// תיקון כפתור "רענן נתונים" כך שיעדכן את הטבלה
document.getElementById("refresh-btn").addEventListener("click", function () {
    fetchData(); // שליפת נתונים מחודשת
});

