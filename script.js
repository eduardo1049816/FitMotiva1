let currentUser = null;
let metas = [];
let pontos = 0;

// AUTO LOGIN
window.onload = function(){
  const user = localStorage.getItem('currentUser');

  if(user){
    currentUser = user;
    loginScreen.style.display='none';
    app.style.display='block';
    welcomeUser.innerText="Seja bem-vindo, "+user+"!";
    loadUserData();
  }
}

// ⚙️ MENU
function toggleSettings(){
  const menu = document.getElementById('settingsMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// 🌎 IDIOMA
function setLanguage(lang){
  const textos = {
    pt:["Nova Meta","Progresso","Metas","Recompensas"],
    en:["New Goal","Progress","Goals","Rewards"]
  };

  document.querySelectorAll('.card h2').forEach((el,i)=>{
    el.innerText = textos[lang][i];
  });

  settingsMenu.style.display='none';
}

// 🔄 TROCAR CONTA
function trocarConta(){
  localStorage.removeItem('currentUser');
  currentUser = null;

  app.style.display = 'none';
  loginScreen.style.display = 'flex';

  loginUser.value = '';
  loginPass.value = '';

  settingsMenu.style.display='none';
}

// 🚪 LOGOUT
function logout(){
  localStorage.removeItem('currentUser');
  location.reload();
}

// 🔔 NOTIFICAÇÕES
function pedirPermissao(){
  if("Notification" in window && Notification.permission !== "granted"){
    Notification.requestPermission();
  }
}

function notificar(titulo, mensagem){
  if("Notification" in window && Notification.permission === "granted"){
    new Notification(titulo,{body:mensagem});
  }
}

function testarNotificacao(){
  notificar("FitMotiva 💪","Teste!");
}

// LOGIN / CADASTRO
function showRegister(){
  loginScreen.style.display='none';
  registerScreen.style.display='flex';
}

function showLogin(){
  registerScreen.style.display='none';
  loginScreen.style.display='flex';
}

function register(){
  const user = registerUser.value;
  const pass = registerPass.value;

  if(!user || !pass){
    registerMsg.innerText="Preencha tudo!";
    return;
  }

  localStorage.setItem('user_'+user, pass);
  registerMsg.innerText="Conta criada!";
}

function login(){
  const user = loginUser.value;
  const pass = loginPass.value;

  if(pass === localStorage.getItem('user_'+user)){
    currentUser = user;
    localStorage.setItem('currentUser', user);

    loginScreen.style.display='none';
    app.style.display='block';

    welcomeUser.innerText="Seja bem-vindo, "+user+"!";

    pedirPermissao();
    loadUserData();

    notificar("Bem-vindo 👋","Login realizado!");
  }else{
    loginMsg.innerText="Erro no login!";
  }
}

// DADOS
function save(){
  localStorage.setItem('metas_'+currentUser, JSON.stringify(metas));
  localStorage.setItem('pontos_'+currentUser, pontos);
}

function loadUserData(){
  metas = JSON.parse(localStorage.getItem('metas_'+currentUser)) || [];
  pontos = parseInt(localStorage.getItem('pontos_'+currentUser)) || 0;
  render();
}

// METAS
function addMeta(){
  const texto = metaInput.value;
  const data = dateInput.value;

  if(!texto) return;

  metas.push({texto,data,concluida:false});
  notificar("Nova meta 🎯",texto);

  metaInput.value='';
  dateInput.value='';

  save();
  render();
}

// TOGGLE META COM XP ANIMADO
function toggleMeta(i){
  metas[i].concluida = !metas[i].concluida;

  let xpGanho = 10;

  if(metas[i].concluida){
    addPontosAnimados(xpGanho);
    notificar("Meta concluída ✅",metas[i].texto);
  }else{
    addPontosAnimados(-xpGanho);
  }

  save();
  render();
}

// ANIMAÇÃO DE PONTOS
function addPontosAnimados(valor){
  const duracao = 800; 
  const passos = 20;
  const incremento = valor / passos;
  let cont = 0;

  let anim = setInterval(()=>{
    pontos += incremento;
    cont++;
    pontosTopo.innerText = Math.round(pontos);
    updateXP();
    if(cont>=passos) clearInterval(anim);
  }, duracao/passos);
}

// EDITAR / DELETAR
function editMeta(i){
  const novo = prompt("Editar tarefa:", metas[i].texto);

  if(novo && novo.trim() !== ''){
    metas[i].texto = novo;
    save();
    render();
  }
}

function deleteMeta(i){
  if(confirm("Apagar tarefa?")){
    metas.splice(i,1);
    save();
    render();
  }
}

// RENDER
function render(){
  const list = metaList;
  list.innerHTML='';

  metas.forEach((m,i)=>{
    const li = document.createElement('li');

    li.innerHTML = `
      <input type="checkbox" ${m.concluida?'checked':''} onclick="toggleMeta(${i})">
      <span style="${m.concluida?'text-decoration:line-through;opacity:0.6':''}">
        ${m.texto}
      </span>
      <button class="edit" onclick="editMeta(${i})">✏️</button>
      <button class="delete" onclick="deleteMeta(${i})">🗑️</button>
    `;

    list.appendChild(li);
  });

  updateProgress();
  renderRewards();
  updateXP();
  updateRanking();

  rewardText.innerText =
    pontos>=50 ? '🎉 Recompensa liberada!' : 'Pontos: '+Math.round(pontos);

  pontosTopo.innerText = Math.round(pontos);
}

// PROGRESSO
function updateProgress(){
  const total = metas.length;
  const done = metas.filter(m=>m.concluida).length;
  const percent = total ? (done/total)*100 : 0;

  progressBar.style.width = percent+'%';
  progressText.innerText = Math.round(percent)+'% concluído';
}

// RECOMPENSAS
function renderRewards(){
  const list = rewardList;
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

// XP / NÍVEL
function updateXP(){
  const xpParaProxNivel = 50;
  const nivelAtual = Math.floor(pontos / xpParaProxNivel) + 1;
  const xpAtual = pontos % xpParaProxNivel;

  nivel.innerText = nivelAtual;
  xpText.innerText = `${Math.round(xpAtual)} / ${xpParaProxNivel} XP`;

  const porcentagem = (xpAtual/xpParaProxNivel)*100;
  xpBar.style.width = porcentagem + '%';
}

// RANKING
function updateRanking(){
  const ranking = [];

  for(let i=0;i<localStorage.length;i++){
    const key = localStorage.key(i);
    if(key.startsWith('pontos_')){
      const user = key.replace('pontos_','');
      const pts = parseInt(localStorage.getItem(key)) || 0;
      ranking.push({user, pontos: pts});
    }
  }

  ranking.sort((a,b)=>b.pontos - a.pontos);

  rankingList.innerHTML='';
  ranking.forEach(r=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${r.user}</span><span>⭐ ${r.pontos}</span>`;
    rankingList.appendChild(li);
  });
}

// NOTIFICAÇÃO DE METAS
function verificarMetas(){
  const hoje = new Date();

  metas.forEach(m => {
    if(!m.data || m.concluida) return;

    const dataMeta = new Date(m.data);
    const diff = dataMeta - hoje;
    const dias = Math.ceil(diff / (1000*60*60*24));

    if(dias === 1){
      notificar("Meta chegando ⏰","Amanhã: "+m.texto);
    }

    if(dias === 0){
      notificar("Meta é hoje 🚨",m.texto);
    }
  });
}

setInterval(verificarMetas,60000);
