// ============================================
// APP TAREFAS + GRATIDÃO - VERSÃO FINAL CORRIGIDA
// ============================================

// DADOS
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || {
    'Segunda': [],
    'Terça': [],
    'Quarta': [],
    'Quinta': [],
    'Sexta': [],
    'Sábado': [],
    'Domingo': []
};

let momentos = JSON.parse(localStorage.getItem('momentos')) || [];

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ELEMENTOS
const pageHoje = document.getElementById('page-hoje');
const pageSemana = document.getElementById('page-semana');
const navBtns = document.querySelectorAll('.nav-btn');
const diaTitulo = document.getElementById('dia-atual');
const dataAtual = document.getElementById('data-atual');
const listaTarefasHoje = document.getElementById('lista-tarefas-hoje');
const galeria = document.getElementById('galeria-gratidao');
const diasContainer = document.getElementById('dias-semana-container');

// MODAIS
const modalTarefa = document.getElementById('modal-tarefa');
const modalFoto = document.getElementById('modal-foto');
const modalOpcoes = document.getElementById('modal-opcoes-tarefa');
const modalVerFoto = document.getElementById('modal-ver-foto');

// INPUTS
const inputDescricao = document.getElementById('input-tarefa-descricao');
const inputHorario = document.getElementById('input-tarefa-horario');
const btnCancelarTarefa = document.getElementById('btn-cancelar-tarefa');
const btnSalvarTarefa = document.getElementById('btn-salvar-tarefa');
const btnAddTarefa = document.getElementById('btn-add-tarefa-hoje');

// FOTOS
const btnAddFoto = document.getElementById('btn-add-foto');
const uploadArea = document.getElementById('upload-area');
const inputFoto = document.getElementById('input-foto');
const inputLegenda = document.getElementById('input-legenda');
const btnCancelarFoto = document.getElementById('btn-cancelar-foto');
const btnSalvarFoto = document.getElementById('btn-salvar-foto');

// OPÇÕES
const opcaoEditar = document.getElementById('opcao-editar');
const opcaoExcluir = document.getElementById('opcao-excluir');
const opcaoCancelar = document.getElementById('opcao-cancelar');

// VISUALIZAR FOTO
const fotoExpandida = document.getElementById('foto-expandida');
const fotoLegenda = document.getElementById('foto-legenda');
const btnFecharFoto = document.getElementById('btn-fechar-foto');
const btnDeletarFoto = document.getElementById('btn-deletar-foto');

// ESTADO
let diaEditando = null;
let tarefaEditando = null;
let fotoEditando = null;
let momentoIndex = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    atualizarData();
    renderizarTarefasHoje();
    renderizarGaleria();
    renderizarSemana();
    
    // Navegação
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.page === 'hoje') {
                pageHoje.classList.add('active');
                pageSemana.classList.remove('active');
                renderizarTarefasHoje();
            } else {
                pageHoje.classList.remove('active');
                pageSemana.classList.add('active');
                renderizarSemana();
            }
        });
    });
    
    // Modal tarefa
    btnAddTarefa.addEventListener('click', () => {
        const hoje = diasSemana[new Date().getDay()];
        diaEditando = hoje;
        tarefaEditando = null;
        inputDescricao.value = '';
        inputHorario.value = '';
        modalTarefa.classList.add('active');
    });
    
    btnCancelarTarefa.addEventListener('click', () => {
        modalTarefa.classList.remove('active');
    });
    
    btnSalvarTarefa.addEventListener('click', salvarTarefa);
    
    // Modal foto
    btnAddFoto.addEventListener('click', () => {
        inputLegenda.value = '';
        modalFoto.classList.add('active');
    });
    
    uploadArea.addEventListener('click', () => {
        inputFoto.click();
    });
    
    inputFoto.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                fotoEditando = event.target.result;
                uploadArea.innerHTML = `<img src="${fotoEditando}" style="width:100%; border-radius:20px; max-height:200px;">`;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    btnCancelarFoto.addEventListener('click', () => {
        modalFoto.classList.remove('active');
        fotoEditando = null;
        inputFoto.value = '';
        uploadArea.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>clique para selecionar uma foto</p>';
    });
    
    btnSalvarFoto.addEventListener('click', salvarMomento);
    
    // Opções tarefa
    opcaoCancelar.addEventListener('click', () => {
        modalOpcoes.classList.remove('active');
    });
    
    opcaoEditar.addEventListener('click', () => {
        modalOpcoes.classList.remove('active');
        if (tarefaEditando) {
            inputDescricao.value = tarefaEditando.descricao;
            inputHorario.value = tarefaEditando.horario || '';
            modalTarefa.classList.add('active');
        }
    });
    
    opcaoExcluir.addEventListener('click', () => {
        modalOpcoes.classList.remove('active');
        if (tarefaEditando && diaEditando) {
            const index = tarefas[diaEditando].findIndex(t => t.id === tarefaEditando.id);
            if (index !== -1) {
                tarefas[diaEditando].splice(index, 1);
                salvarTarefas();
                renderizarTarefasHoje();
                renderizarSemana();
            }
        }
    });
    
    // Modal visualizar foto
    btnFecharFoto.addEventListener('click', () => {
        modalVerFoto.classList.remove('active');
    });
    
    btnDeletarFoto.addEventListener('click', () => {
        if (momentoIndex !== null) {
            momentos.splice(momentoIndex, 1);
            localStorage.setItem('momentos', JSON.stringify(momentos));
            modalVerFoto.classList.remove('active');
            renderizarGaleria();
        }
    });
});

// ========== DATA ==========
function atualizarData() {
    const hoje = new Date();
    const diaSemana = diasSemana[hoje.getDay()];
    const dia = hoje.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[hoje.getMonth()];
    
    diaTitulo.textContent = diaSemana;
    dataAtual.textContent = `${dia} de ${mes}`;
    
    // Atualizar as tarefas quando o dia muda (meia-noite)
    const agora = new Date();
    const amanha = new Date(agora);
    amanha.setDate(agora.getDate() + 1);
    amanha.setHours(0, 0, 0, 0);
    const tempoAteAmanha = amanha - agora;
    
    setTimeout(() => {
        // CRÍTICO: Resetar tarefas concluídas no novo dia
        resetarTarefasConcluidas();
        atualizarData();
        renderizarTarefasHoje();
        renderizarSemana();
    }, tempoAteAmanha);
}

// ========== RESETAR TAREFAS CONCLUÍDAS NO NOVO DIA ==========
function resetarTarefasConcluidas() {
    const hoje = diasSemana[new Date().getDay()];
    
    // Resetar apenas as tarefas do dia atual
    if (tarefas[hoje]) {
        tarefas[hoje] = tarefas[hoje].map(tarefa => ({
            ...tarefa,
            concluida: false
        }));
        salvarTarefas();
    }
}

// ========== TAREFAS ==========
function renderizarTarefasHoje() {
    const hoje = diasSemana[new Date().getDay()];
    const tarefasHoje = tarefas[hoje] || [];
    
    if (tarefasHoje.length === 0) {
        listaTarefasHoje.innerHTML = `
            <div class="mensagem-vazia">
                <i class="fas fa-sparkles"></i>
                <p>nenhuma tarefa para hoje ✨</p>
                <small>clique no + para adicionar</small>
            </div>
        `;
        return;
    }
    
    let html = '';
    tarefasHoje.forEach(tarefa => {
        const horarioHtml = tarefa.horario ? 
            `<span class="tarefa-horario"><i class="far fa-clock"></i> ${tarefa.horario}</span>` : '';
        
        html += `
            <div class="tarefa-item">
                <button class="tarefa-checkbox ${tarefa.concluida ? 'checked' : ''}" 
                        onclick="toggleTarefa('${hoje}', '${tarefa.id}')">
                    ${tarefa.concluida ? '✓' : ''}
                </button>
                <div class="tarefa-conteudo">
                    <span class="tarefa-descricao ${tarefa.concluida ? 'concluida' : ''}">
                        ${tarefa.descricao}
                    </span>
                    ${horarioHtml}
                </div>
                <button class="tarefa-opcoes" onclick="abrirOpcoes('${hoje}', '${tarefa.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
    });
    
    listaTarefasHoje.innerHTML = html;
}

window.toggleTarefa = (dia, id) => {
    const tarefa = tarefas[dia].find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefas();
        renderizarTarefasHoje();
        renderizarSemana();
    }
};

window.abrirOpcoes = (dia, id) => {
    diaEditando = dia;
    tarefaEditando = tarefas[dia].find(t => t.id === id);
    modalOpcoes.classList.add('active');
};

function salvarTarefa() {
    const descricao = inputDescricao.value.trim();
    if (!descricao) {
        alert('Digite uma tarefa!');
        return;
    }
    
    if (!diaEditando) {
        alert('Erro: dia não selecionado!');
        return;
    }
    
    if (tarefaEditando) {
        // EDITAR TAREFA EXISTENTE
        tarefaEditando.descricao = descricao;
        tarefaEditando.horario = inputHorario.value || null;
    } else {
        // ADICIONAR NOVA TAREFA
        tarefas[diaEditando].push({
            id: Date.now().toString(),
            descricao: descricao,
            horario: inputHorario.value || null,
            concluida: false
        });
    }
    
    salvarTarefas();
    modalTarefa.classList.remove('active');
    renderizarTarefasHoje();
    renderizarSemana();
}

function renderizarSemana() {
    let html = '';
    
    diasSemana.forEach(dia => {
        const tarefasDia = tarefas[dia] || [];
        let tarefasHtml = '';
        
        if (tarefasDia.length === 0) {
            tarefasHtml = `<div class="sem-tarefas-dia">✨ nenhuma tarefa</div>`;
        } else {
            tarefasDia.forEach(tarefa => {
                tarefasHtml += `
                    <div class="tarefa-item-dia">
                        <div class="tarefa-info-dia">
                            <button class="tarefa-checkbox-dia ${tarefa.concluida ? 'checked' : ''}"
                                    onclick="toggleTarefa('${dia}', '${tarefa.id}')">
                                ${tarefa.concluida ? '✓' : ''}
                            </button>
                            <span class="tarefa-descricao-dia ${tarefa.concluida ? 'concluida' : ''}">
                                ${tarefa.descricao}
                            </span>
                            ${tarefa.horario ? `<span class="tarefa-horario-dia">${tarefa.horario}</span>` : ''}
                        </div>
                        <button class="tarefa-opcoes" onclick="abrirOpcoesSemana('${dia}', '${tarefa.id}')">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                `;
            });
        }
        
        html += `
            <div class="dia-card">
                <div class="dia-card-header">
                    <span class="dia-nome">${dia}</span>
                    <button class="btn-add-tarefa-dia" onclick="adicionarTarefaDia('${dia}')">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="tarefas-lista-dia">
                    ${tarefasHtml}
                </div>
            </div>
        `;
    });
    
    diasContainer.innerHTML = html;
}

// FUNÇÃO ESPECIAL PARA ABRIR OPÇÕES NA SEMANA (corrige o bug)
window.abrirOpcoesSemana = (dia, id) => {
    diaEditando = dia;
    tarefaEditando = tarefas[dia].find(t => t.id === id);
    modalOpcoes.classList.add('active');
    console.log(`Abrindo opções para: ${dia} - ${tarefaEditando?.descricao}`);
};

window.adicionarTarefaDia = (dia) => {
    diaEditando = dia;
    tarefaEditando = null;
    inputDescricao.value = '';
    inputHorario.value = '';
    modalTarefa.classList.add('active');
    console.log(`Adicionando tarefa para: ${dia}`);
};

function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// ========== GRATIDÃO ==========
function salvarMomento() {
    if (!fotoEditando) {
        alert('Selecione uma foto!');
        return;
    }
    
    momentos.push({
        id: Date.now().toString(),
        foto: fotoEditando,
        legenda: inputLegenda.value.trim() || 'momento especial ✨'
    });
    
    localStorage.setItem('momentos', JSON.stringify(momentos));
    
    modalFoto.classList.remove('active');
    fotoEditando = null;
    inputFoto.value = '';
    uploadArea.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>clique para selecionar uma foto</p>';
    renderizarGaleria();
}

function renderizarGaleria() {
    const fotosReversas = [...momentos].reverse();
    
    if (fotosReversas.length === 0) {
        galeria.innerHTML = `
            <div class="gratidao-placeholder" style="grid-column: span 3; aspect-ratio: 2; padding: 30px;" 
                 onclick="document.getElementById('btn-add-foto').click()">
                <i class="fas fa-camera" style="font-size: 42px;"></i>
                <span style="font-size: 16px;">adicionar primeiro momento</span>
            </div>
        `;
        return;
    }
    
    let html = '';
    fotosReversas.forEach((momento, idx) => {
        const realIndex = momentos.length - 1 - idx;
        html += `
            <div class="gratidao-item" onclick="verMomento(${realIndex})">
                <img src="${momento.foto}" alt="Momento especial">
                <div class="legenda-preview">${momento.legenda || '✨'}</div>
            </div>
        `;
    });
    
    html += `
        <div class="gratidao-placeholder" onclick="document.getElementById('btn-add-foto').click()">
            <i class="fas fa-plus"></i>
            <span>adicionar</span>
        </div>
    `;
    
    galeria.innerHTML = html;
}

window.verMomento = (index) => {
    if (momentos[index]) {
        fotoExpandida.src = momentos[index].foto;
        fotoLegenda.textContent = momentos[index].legenda;
        momentoIndex = index;
        modalVerFoto.classList.add('active');
    }
};

// EXPORTAR FUNÇÕES GLOBAIS
window.toggleTarefa = toggleTarefa;
window.abrirOpcoes = abrirOpcoes;
window.abrirOpcoesSemana = abrirOpcoesSemana;
window.adicionarTarefaDia = adicionarTarefaDia;
window.verMomento = verMomento;
