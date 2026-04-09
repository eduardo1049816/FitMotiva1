let currentUser = null;
let metas = [];
let pontos = 0;

// ==========================
// 🔔 NOTIFICAÇÕES
// ==========================

// pedir permissão
function pedirPermissao(){
  if(Notification.permission !== "granted"){
    Notification.requestPermission();
  }
}

// enviar notificação
function notificar(titulo, mensagem){
  if(Notification.permission === "granted"){
    new Notification(titulo, {
      body: mensagem,
      icon: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png"
    });
  }
}

// botão de teste
function testarNotificacao(){
  notificar("FitMotiva 💪", "Essa é uma notificação de teste!");
}

// ==========================
// LOGIN / CADASTRO
// ==========================

function showRegister(){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('registerScreen').style.display='flex';
}

function showLogin(){
  document.getElementById('registerScreen').style.display='none';
  document.getElementById('loginScreen').style.display='flex';
}

// cadastro
function register(){
  const user = document.getElementById('registerUser').value;
  const pass = document.getElementById('registerPass').value;

  if(!user || !pass){
    document.getElementById('registerMsg').innerText = "Preencha tudo!";
    return;
  }

  localStorage.setItem('user_'+user, pass);
  document.getElementById('registerMsg').innerText = "Conta criada!";
}

// login
function login(){
  const user = document.getElementById('loginUser').value;
  const pass = document.getElementById('loginPass').value;

  if(pass === localStorage.getItem('user_'+user)){
    currentUser = user;

    document.getElementById('loginScreen').style.display='none';
    document.getElementById('app').style.display='block';

    document.getElementById('welcomeUser').innerText =
      "Seja bem-vindo, " + user + "!";

    pedirPermissao(); // 🔔 pede permissão aqui

    loadUserData();

    notificar("Bem-vindo 👋", "Login realizado com sucesso!");
  }else{
    document.getElementById('loginMsg').innerText="Erro no login!";
  }
}

// ==========================
// DADOS
// ==========================

function save(){
  localStorage.setItem('metas_'+currentUser, JSON.stringify(metas));
  localStorage.setItem('pontos_'+currentUser, pontos);
}

function loadUserData(){
  metas = JSON.parse(localStorage.getItem('metas_'+currentUser)) || [];
  pontos = parseInt(localStorage.getItem('pontos_'+currentUser)) || 0;
  render();
}

// ==========================
// METAS
// ==========================

// adicionar meta
function addMeta(){
  const texto = document.getElementById('metaInput').value;
  const data = document.getElementById('dateInput').value;

  if(!texto) return;

  metas.push({texto,data,concluida:false});

  notificar("Nova meta 🎯", texto);

  save();
  render();
}

// marcar concluída
function toggleMeta(i){
  metas[i].concluida = !metas[i].concluida;

  if(metas[i].concluida){
    pontos += 10;
    notificar("Meta concluída ✅", metas[i].texto);
  }else{
    pontos -= 10;
  }

  save();
  render();
}

// editar
function editMeta(i){
  const novo = prompt("Editar tarefa:", metas[i].texto);

  if(novo && novo.trim() !== ''){
    metas[i].texto = novo;
    notificar("Meta atualizada ✏️", novo);
    save();
    render();
  }
}

// excluir
function deleteMeta(i){
  if(confirm("Apagar tarefa?")){
    notificar("Meta removida 🗑️", metas[i].texto);
    metas.splice(i,1);
    save();
    render();
  }
}

// ==========================
// RENDER
// ==========================

function render(){
  const list = document.getElementById('metaList');
  list.innerHTML='';

  metas.forEach((m,i)=>{
    const li = document.createElement('li');

    li.innerHTML = `
      <input type="checkbox" ${m.concluida?'checked':''} onclick="toggleMeta(${i})">
      <span>${m.texto}</span>
      <button class="edit" onclick="editMeta(${i})">✏️</button>
      <button class="delete" onclick="deleteMeta(${i})">🗑️</button>
    `;

    list.appendChild(li);
  });

  updateProgress();
  renderRewards();

  document.getElementById('rewardText').innerText =
    pontos>=50 ? '🎉 Recompensa liberada!' : 'Pontos: '+pontos;
}

// ==========================
// PROGRESSO
// ==========================

function updateProgress(){
  const total = metas.length;
  const done = metas.filter(m=>m.concluida).length;
  const percent = total ? (done/total)*100 : 0;

  document.getElementById('progressBar').style.width = percent+'%';
  document.getElementById('progressText').innerText =
    Math.round(percent)+'% concluído';
}

// ==========================
// RECOMPENSAS
// ==========================

function renderRewards(){
  const list = document.getElementById('rewardList');
  list.innerHTML='';

  const rewards = [
    {nome:'🍫 Comer algo que gosta', pontos:20},
    {nome:'🎬 Assistir filme', pontos:40},
    {nome:'🛍️ Comprar algo', pontos:60},
    {nome:'🎉 Descanso', pontos:100}
  ];

  rewards.forEach((r,i)=>{
    const li = document.createElement('li');

    if(pontos >= r.pontos){
      li.innerHTML = `${r.nome} <button onclick="resgatar(${i})">Resgatar</button>`;
    }else{
      li.innerText = `${r.nome} 🔒 (${r.pontos})`;
    }

    list.appendChild(li);
  });
}

// resgatar
function resgatar(i){
  const rewards = [
    {nome:'🍫 Comer algo que gosta', pontos:20},
    {nome:'🎬 Assistir filme', pontos:40},
    {nome:'🛍️ Comprar algo', pontos:60},
    {nome:'🎉 Descanso', pontos:100}
  ];

  if(pontos >= rewards[i].pontos){
    pontos -= rewards[i].pontos;

    notificar("Recompensa 🎁", rewards[i].nome + " resgatada!");

    save();
    render();
  }
}