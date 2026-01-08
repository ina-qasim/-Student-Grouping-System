// -----------------------------
// 1) LocalStorage Keys
// -----------------------------
const LS_STUDENTS_KEY = "student_grouping_students_v1";
const LS_GROUPS_KEY   = "student_grouping_groups_v1";
const LS_MODE_KEY     = "student_grouping_mode_v1";
const LS_NUM_KEY      = "student_grouping_num_v1";
const LS_SIZE_KEY     = "student_grouping_size_v1";

// -----------------------------
// 2) Default Students
// -----------------------------
const DEFAULT_STUDENTS = [
  "Abdiasis Mohamed","Fadumo Qasim","Mandeq Ali","Ridwaan Abdirahman","Ikraan Muqtar",
  "Luqmaan Abdi","Samiiro Faysal","Ubah Isse","Najmo Muhidin","Hersi Hussien",
  "Amina Osman","Aisha Isse","Fatuma Rashid","Hanan Abdullahi","Hawo Abdullahi",
  "Khaalid Yusuf","Sahra Ahmed","Abdirisaq Noor","Maryan Ali","Saciid Jama",
  "Hodan Warsame","Ilham Hassan","Khadija Aden","Yahye Ahmed","Nasteexo Ali",
  "Shukri Mohamed","Sakariye Osman","Fartun Abdi","Mohamed Said","Nimco Ali",
  "Farhan Yusuf","Zamzam Mohamed","Ibrahim Ali","Ayaanle Hassan","Rahma Omar",
  "Asha Mohamed","Hassan Abdi","Saida Nur","Abdullahi Mohamed","Leyla Ahmed",
  "Qamar Ali","Bilan Abdi","Yusuf Ahmed","Munira Hassan","Sagal Mohamed",
  "Kowsar Ali","Ismail Osman","Nuur Cabdi","Hawa Nur","Deqa Hassan",
  "Sahro Ali","Nimco Xasan","Abdirahman Jama","Faduma Ali","Hibo Nur",
  "Nasra Mohamed","Amina Abdullahi","Hussein Omar","Hodan Ali","Ilays Ahmed"
];

// -----------------------------
// 3) LocalStorage Helpers
// -----------------------------
function lsSet(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}
function lsGet(key){
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}

function saveStudents(students){ lsSet(LS_STUDENTS_KEY, students); }
function loadStudents(){ return lsGet(LS_STUDENTS_KEY); }

function saveGroups(groups){ lsSet(LS_GROUPS_KEY, groups); }
function loadGroups(){ return lsGet(LS_GROUPS_KEY) || []; }

// -----------------------------
// 4) DOM Elements
// -----------------------------
const studentsInput   = document.getElementById("studentsInput");
const countText       = document.getElementById("countText");
const modeNumBtn      = document.getElementById("modeNumBtn");
const modeSizeBtn     = document.getElementById("modeSizeBtn");
const numGroupsField  = document.getElementById("numGroupsField");
const sizeGroupsField = document.getElementById("sizeGroupsField");
const numGroupsInput  = document.getElementById("numGroupsInput");
const groupSizeInput  = document.getElementById("groupSizeInput");
const createBtn       = document.getElementById("createBtn");
const errorBox        = document.getElementById("errorBox");
const emptyState      = document.getElementById("emptyState");
const groupsGrid      = document.getElementById("groupsGrid");
const topHint         = document.getElementById("topHint");
const shuffleBtn      = document.getElementById("shuffleBtn");
const searchInput     = document.getElementById("searchInput");

let mode = "number";

// -----------------------------
// 5) Init
// -----------------------------
(function init(){
  const stored = loadStudents();
  const students = stored && stored.length ? stored : DEFAULT_STUDENTS;
  saveStudents(students);
  studentsInput.value = students.join("\n");

  const savedMode = lsGet(LS_MODE_KEY);
  if(savedMode) mode = savedMode;
  setMode(mode);

  const groups = loadGroups();
  if(groups.length){
    renderGroups(groups);
    topHint.style.display = "block";
    topHint.textContent = `Restored ${groups.length} group(s).`;
  } else {
    emptyState.style.display = "flex";
    groupsGrid.style.display = "none";
  }

  updateCountAndPersist();
})();

// -----------------------------
// 6) Students Helpers
// -----------------------------
function parseStudents(){
  return [...new Set(
    studentsInput.value
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean)
  )];
}

function updateCountAndPersist(){
  const list = parseStudents();
  countText.textContent = `${list.length} students entered`;
  saveStudents(list);
}

// -----------------------------
// 7) UI Helpers
// -----------------------------
function showError(msg){
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}
function clearError(){
  errorBox.style.display = "none";
}

function setMode(next){
  mode = next;
  lsSet(LS_MODE_KEY, mode);
  clearError();

  numGroupsField.style.display = mode === "number" ? "block" : "none";
  sizeGroupsField.style.display = mode === "size" ? "block" : "none";
  modeNumBtn.classList.toggle("active", mode === "number");
  modeSizeBtn.classList.toggle("active", mode === "size");
}

// -----------------------------
// 8) Group Logic
// -----------------------------
function shuffleArray(arr){
  return [...arr].sort(() => Math.random() - 0.5);
}

function distributeByGroups(students, n){
  return Array.from({length:n}, (_,i)=>
    students.filter((_,idx)=>idx % n === i)
  );
}

function distributeBySize(students, size){
  const groups = [];
  for(let i=0;i<students.length;i+=size){
    groups.push(students.slice(i,i+size));
  }
  return groups;
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, m =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;" }[m])
  );
}

// -----------------------------
// 9) Render Groups
// -----------------------------
function renderGroups(groups){
  groupsGrid.innerHTML = "";

  if(!groups.length){
    emptyState.style.display = "flex";
    groupsGrid.style.display = "none";
    topHint.style.display = "none";
    return;
  }

  groups.forEach((members, idx)=>{
    const card = document.createElement("div");
    card.className = "card groupCard";
    card.style.setProperty("--i", idx);
    card.style.setProperty("--hue", (idx*55)%360);

    card.innerHTML = `
      <div class="groupHead">
        <h3 class="groupTitle">
          Group ${idx+1}
          <button class="removeGroupBtn" data-group="${idx}">✖</button>
        </h3>
        <div class="badge"><span>${members.length}</span></div>
      </div>

      <div class="members">
        ${members.map((name,i)=>`
          <div class="memberRow">
            <div class="num">${i+1}</div>
            <div class="name">${escapeHtml(name)}</div>
            <button class="removeStudentBtn"
              data-group="${idx}"
              data-student="${i}">×</button>
          </div>
        `).join("")}
      </div>
    `;
    groupsGrid.appendChild(card);
  });

  emptyState.style.display = "none";
  groupsGrid.style.display = "grid";
}

// -----------------------------
// 9.5) Filter Groups (Search)
// -----------------------------
function filterGroups(query){
  const q = query.toLowerCase();
  document.querySelectorAll(".groupCard").forEach(card=>{
    let visible = 0;
    card.querySelectorAll(".memberRow").forEach(row=>{
      const name = row.querySelector(".name").textContent.toLowerCase();
      const match = name.includes(q);
      row.style.display = match ? "flex" : "none";
      if(match) visible++;
    });
    card.style.display = visible ? "block" : "none";
  });
}

// -----------------------------
// 10) Create Groups
// -----------------------------
function createGroups(){
  clearError();

  let students = parseStudents();
  if(students.length < 1){
    showError("Please enter at least 1 student.");
    return;
  }

  students = shuffleArray(students);
  let groups = [];

  if(mode === "number"){
    const n = Number(numGroupsInput.value);
    if(!n || n > students.length){
      showError("Invalid number of groups.");
      return;
    }
    lsSet(LS_NUM_KEY, n);
    groups = distributeByGroups(students, n);
  } else {
    const size = Number(groupSizeInput.value);
    if(!size){
      showError("Invalid group size.");
      return;
    }
    lsSet(LS_SIZE_KEY, size);
    groups = distributeBySize(students, size);
  }

  saveGroups(groups);
  renderGroups(groups);
}

// -----------------------------
// 11) Events
// -----------------------------
studentsInput.addEventListener("input", updateCountAndPersist);
modeNumBtn.onclick = ()=>setMode("number");
modeSizeBtn.onclick = ()=>setMode("size");
createBtn.onclick = createGroups;

shuffleBtn.onclick = ()=>{
  studentsInput.value = shuffleArray(parseStudents()).join("\n");
  updateCountAndPersist();
};

// -----------------------------
// 12) UI REMOVE GROUP / STUDENT
// -----------------------------
groupsGrid.addEventListener("click", e=>{
  const groups = loadGroups();

  if(e.target.classList.contains("removeGroupBtn")){
    groups.splice(e.target.dataset.group,1);
  }

  if(e.target.classList.contains("removeStudentBtn")){
    const g = e.target.dataset.group;
    const s = e.target.dataset.student;
    if(groups[g]){
      groups[g].splice(s,1);
      if(groups[g].length===0) groups.splice(g,1);
    }
  }

  saveGroups(groups);
  renderGroups(groups);
});

// -----------------------------
// 13) Search Event
// -----------------------------
if(searchInput){
  searchInput.addEventListener("input", e=>{
    filterGroups(e.target.value);
  });
}
