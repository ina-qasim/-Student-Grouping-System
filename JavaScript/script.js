

const LS_STUDENTS_KEY = "students_v1";
const LS_GROUPS_KEY   = "groups_v1";

let studentsArray = [];
let groupsArray   = [];
let mode = "number";

/* ===============================
                    DOMm
   =============================== */

const studentsInput = document.getElementById("studentsInput");
const countText = document.getElementById("countText");
const fileInput = document.getElementById("fileInput");
const searchInput = document.getElementById("searchInput");
const groupsGrid = document.getElementById("groupsGrid");
const emptyState = document.getElementById("emptyState");
const topHint = document.getElementById("topHint");
const shuffleBtn = document.getElementById("shuffleBtn");
const createBtn = document.getElementById("createBtn");
const errorBox = document.getElementById("errorBox");

const modeNumBtn = document.getElementById("modeNumBtn");
const modeSizeBtn = document.getElementById("modeSizeBtn");
const numGroupsInput = document.getElementById("numGroupsInput");
const groupSizeInput = document.getElementById("groupSizeInput");
const numGroupsField = document.getElementById("numGroupsField");
const sizeGroupsField = document.getElementById("sizeGroupsField");



(function init(){
  studentsArray = JSON.parse(localStorage.getItem(LS_STUDENTS_KEY)) || [];
  groupsArray = JSON.parse(localStorage.getItem(LS_GROUPS_KEY)) || [];

  studentsInput.value = studentsArray.join("\n");
  updateCount();

  if(groupsArray.length){
    renderGroups(groupsArray);
    showHint(`Restored ${groupsArray.length} group(s).`);
  }
})();

/* ===============================
   FILE IMPORT
   =============================== */

fileInput.addEventListener("change", async e => {
  const file = e.target.files[0];
  if(!file) return;

  const ext = file.name.split(".").pop().toLowerCase();

  if(ext === "txt" || ext === "csv"){
    const text = await file.text();
    studentsArray = parseNames(text);
  }

  if(ext === "pdf"){
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:buffer}).promise;
    let text = "";
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const c = await page.getTextContent();
      text += c.items.map(i=>i.str).join("\n");
    }
    studentsArray = parseNames(text);
  }

  syncStudents();
});



function parseNames(text){
  return [...new Set(
    text.split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean)
  )];
}

function syncStudents(){
  localStorage.setItem(LS_STUDENTS_KEY, JSON.stringify(studentsArray));
  studentsInput.value = studentsArray.join("\n");
  updateCount();
}

function updateCount(){
  countText.textContent = `${studentsArray.length} students`;
}

function showHint(msg){
  topHint.textContent = msg;
  topHint.style.display = "flex";
}

function shuffle(arr){
  return [...arr].sort(()=>Math.random()-0.5);
}

/* ===============================
   TEXTAREA EDITTINGG
   =============================== */

studentsInput.addEventListener("input", ()=>{
  studentsArray = parseNames(studentsInput.value);
  syncStudents();
});

/* ===============================
   GROUPING
   =============================== */

function createGroups(){
  if(!studentsArray.length) return;

  let list = shuffle(studentsArray);
  let groups = [];

  if(mode === "number"){
    const n = Number(numGroupsInput.value);
    if(!n || n>list.length) return;
    groups = Array.from({length:n},(_,i)=>list.filter((_,j)=>j%n===i));
  }else{
    const size = Number(groupSizeInput.value);
    if(!size) return;
    for(let i=0;i<list.length;i+=size){
      groups.push(list.slice(i,i+size));
    }
  }

  groupsArray = groups;
  localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(groups));
  renderGroups(groups);
}

createBtn.onclick = createGroups;

/* ===============================
   RENDER
   =============================== */

function renderGroups(groups){
  groupsGrid.innerHTML = "";
  emptyState.style.display = groups.length ? "none" : "flex";

  groups.forEach((g,gi)=>{
    const card = document.createElement("div");
    card.className = "card groupCard";
    card.innerHTML = `
      <div class="groupHead">
        <h3 class="groupTitle">
          Group ${gi+1}
          <button class="removeGroupBtn" data-g="${gi}">✖</button>
        </h3>
        <div class="badge">${g.length}</div>
      </div>
      <div class="members">
        ${g.map((n,i)=>`
          <div class="memberRow">
            <div class="num">${i+1}</div>
            <div class="name">${n}</div>
            <button class="removeStudentBtn" data-g="${gi}" data-i="${i}">×</button>
          </div>
        `).join("")}
      </div>
    `;
    groupsGrid.appendChild(card);
  });
}

/* ===============================
   REMOVE ACTIONS
   =============================== */

groupsGrid.addEventListener("click", e=>{
  if(e.target.classList.contains("removeGroupBtn")){
    groupsArray.splice(e.target.dataset.g,1);
  }
  if(e.target.classList.contains("removeStudentBtn")){
    const g = e.target.dataset.g;
    const i = e.target.dataset.i;
    groupsArray[g].splice(i,1);
    if(!groupsArray[g].length) groupsArray.splice(g,1);
  }
  localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(groupsArray));
  renderGroups(groupsArray);
});

/* ===============================
   SEARCH FILTER
   =============================== */

searchInput.addEventListener("input", ()=>{
  const q = searchInput.value.toLowerCase();
  document.querySelectorAll(".memberRow").forEach(r=>{
    r.style.display = r.innerText.toLowerCase().includes(q) ? "flex" : "none";
  });
});

/* ===============================
   MODE
   =============================== */

modeNumBtn.onclick = ()=>{
  mode="number";
  numGroupsField.style.display="block";
  sizeGroupsField.style.display="none";
};
modeSizeBtn.onclick = ()=>{
  mode="size";
  sizeGroupsField.style.display="block";
  numGroupsField.style.display="none";
};

shuffleBtn.onclick = ()=>{
  studentsArray = shuffle(studentsArray);
  syncStudents();
};
