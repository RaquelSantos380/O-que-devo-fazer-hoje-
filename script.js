// Dados
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || {
    'Segunda': [],
    'Terça': [],
    'Quarta': [],
    'Quinta': [],
    'Sexta': [],
    'Sábado': [],
    'Domingo': []
};

const diasMap = {
    'Seg': 'Segunda',
    'Ter': 'Terça',
    'Qua': 'Quarta',
    'Qui': 'Quinta',
    'Sex': 'Sexta',
    'Sáb': 'Sábado',
    'Dom': 'Domingo'
};

const diasAbrev = {
    'Segunda': 'Seg',
    'Terça': 'Ter',
    'Quarta': 'Qua',
    'Quinta': 'Qui',
    'Sexta': 'Sex',
    'Sábado': 'Sáb',
    'Domingo': 'Dom'
};

// Elementos DOM
const telaPrincipal = document.getElementById('telaPrincipal');
const telaEdicao = document.getElementById('telaEdicao');
const btnEditar = document.getElementById('btnEditar');
const tarefasHoje = document.getElementById('tarefasHoje');
const tarefasEdicao = document.getElementById('tarefasEdicao');
const dataAtual = document.getElementById('dataAtual');
const diaSelecionadoLabel = document.getElementById('diaSelecionadoLabel');
const novaTarefa = document.getElementById('novaTarefa');
const btnAdicionar = document.getElementById('btnAdicionar');
const diasBotoes = document.querySelectorAll('.dia-btn');

// Estado atual
let diaEditando = 'Segunda';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    atualizarData();
    mostrarTarefasHoje();
    setInterval(atualizarData, 1000);
    
    // Event listeners
    btnEditar.addEventListener('click', toggleTela);
    btnAdicionar.addEventListener('click', adicionarTarefa);
    novaTarefa.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarTarefa();
    });
    
    diasBotoes.forEach(btn => {
        btn.addEventListener('click', () => {
            const diaAbrev = btn.dataset.dia;
            selecionarDia(diaAbrev);
        });
    });
    
    // Selecionar primeira segunda por padrão
    selecionarDia('Seg');
});

// Atualizar data
function atualizarData() {
    const hoje = new Date();
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    
    const diaSemana = dias[hoje.getDay()];
    const dia = hoje.getDate();
    const mes = meses[hoje.getMonth()];
    
    dataAtual.textContent = `${diaSemana}, ${dia} de ${mes}`;
    mostrarTarefasHoje();
}

// Mostrar tarefas do dia atual
function mostrarTarefasHoje() {
    const hoje = new Date();
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaAtual = dias[hoje.getDay()];
    
    const tarefasHojeArray = tarefas[diaAtual] || [];
    renderizarTarefas(tarefasHoje, tarefasHojeArray, diaAtual);
}

// Renderizar lista de tarefas
function renderizarTarefas(container, tarefasArray, dia) {
    if (!container) return;
    
    if (!tarefasArray || tarefasArray.length === 0) {
        container.innerHTML = `
            <div class="mensagem-vazia">
                ⋆｡°✩ Nenhuma tarefa para hoje<br>
                Que tal adicionar na edição? ✩°｡⋆
            </div>
        `;
        return;
    }
    
    let html = '';
    tarefasArray.forEach((tarefa, index) => {
        html += `
            <div class="tarefa-item" data-dia="${dia}" data-indice="${index}">
                <button class="tarefa-check ${tarefa.concluida ? 'concluida' : ''}">
                    ${tarefa.concluida ? '✓' : '○'}
                </button>
                <span class="tarefa-texto ${tarefa.concluida ? 'concluida' : ''}">
                    ${tarefa.descricao}
                </span>
                <button class="tarefa-foto">
                    📷
                </button>
                <span class="foto-indicador">
                    ${tarefa.foto ? '📸' : ''}
                </span>
                <button class="tarefa-deletar">
                    ✕
                </button>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Adicionar eventos
    container.querySelectorAll('.tarefa-item').forEach(item => {
        const dia = item.dataset.dia;
        const indice = parseInt(item.dataset.indice);
        
        item.querySelector('.tarefa-check').addEventListener('click', () => {
            toggleConcluida(dia, indice);
        });
        
        item.querySelector('.tarefa-deletar').addEventListener('click', () => {
            deletarTarefa(dia, indice);
        });
        
        item.querySelector('.tarefa-foto').addEventListener('click', () => {
            abrirModalFoto(dia, indice);
        });
    });
}

// Alternar concluída
function toggleConcluida(dia, indice) {
    if (tarefas[dia] && tarefas[dia][indice]) {
        tarefas[dia][indice].concluida = !tarefas[dia][indice].concluida;
        salvarTarefas();
        
        // Atualizar ambas as telas
        const hoje = new Date();
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const diaAtual = dias[hoje.getDay()];
        
        if (containerAtual() === telaPrincipal) {
            mostrarTarefasHoje();
        } else {
            mostrarTarefasEdicao(diaEditando);
        }
    }
}

// Deletar tarefa
function deletarTarefa(dia, indice) {
    if (tarefas[dia]) {
        tarefas[dia].splice(indice, 1);
        salvarTarefas();
        
        const hoje = new Date();
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const diaAtual = dias[hoje.getDay()];
        
        if (containerAtual() === telaPrincipal) {
            mostrarTarefasHoje();
        } else {
            mostrarTarefasEdicao(diaEditando);
        }
    }
}

// Alternar entre telas
function toggleTela() {
    if (telaPrincipal.classList.contains('ativa')) {
        // Ir para edição
        telaPrincipal.classList.remove('ativa');
        telaEdicao.classList.add('ativa');
        btnEditar.textContent = '←';
    } else {
        // Voltar para principal
        telaEdicao.classList.remove('ativa');
        telaPrincipal.classList.add('ativa');
        btnEditar.textContent = '✎';
        mostrarTarefasHoje();
    }
}

// Qual tela está ativa?
function containerAtual() {
    return telaPrincipal.classList.contains('ativa') ? telaPrincipal : telaEdicao;
}

// Selecionar dia na edição
function selecionarDia(diaAbrev) {
    const diaCompleto = diasMap[diaAbrev];
    diaEditando = diaCompleto;
    
    diasBotoes.forEach(btn => {
        btn.classList.remove('ativo');
        if (btn.dataset.dia === diaAbrev) {
            btn.classList.add('ativo');
        }
    });
    
    diaSelecionadoLabel.textContent = `Tarefas de ${diaCompleto}`;
    mostrarTarefasEdicao(diaCompleto);
}

// Mostrar tarefas na edição
function mostrarTarefasEdicao(dia) {
    const tarefasDia = tarefas[dia] || [];
    renderizarTarefas(tarefasEdicao, tarefasDia, dia);
}

// Adicionar nova tarefa
function adicionarTarefa() {
    const descricao = novaTarefa.value.trim();
    if (!descricao || !diaEditando) return;
    
    if (!tarefas[diaEditando]) {
        tarefas[diaEditando] = [];
    }
    
    tarefas[diaEditando].push({
        descricao: descricao,
        concluida: false,
        foto: ''
    });
    
    salvarTarefas();
    novaTarefa.value = '';
    
    mostrarTarefasEdicao(diaEditando);
    mostrarTarefasHoje(); // Atualizar tela principal também
}

// Salvar no localStorage
function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Modal de fotos (simplificado)
function abrirModalFoto(dia, indice) {
    // Implementação simplificada - apenas para mostrar que a funcionalidade existe
    alert('Funcionalidade de fotos em desenvolvimento!');
    
    // Versão real usaria FileReader e input type="file"
    // mas por enquanto é só a interface
}
