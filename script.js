// ============================================
// APP TAREFAS + GRATIDÃO - VERSÃO SEM LIMITES
// ============================================

// ============================================
// 1. DADOS E CONFIGURAÇÕES
// ============================================

// Tarefas organizadas por dia
let tarefas = JSON.parse(localStorage.getItem('tarefas')) || {
    'Segunda': [],
    'Terça': [],
    'Quarta': [],
    'Quinta': [],
    'Sexta': [],
    'Sábado': [],
    'Domingo': []
};

// Momentos de gratidão (sem limite!)
let momentosGratidao = JSON.parse(localStorage.getItem('momentos')) || [];

// Dias da semana
const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// ============================================
// 2. ELEMENTOS DO DOM
// ============================================

// Páginas e navegação
const pageHoje = document.getElementById('page-hoje');
const pageSemana = document.getElementById('page-semana');
const navBtns = document.querySelectorAll('.nav-btn');
const diaTitulo = document.getElementById('dia-atual');
const dataAtual = document.getElementById('data-atual');
const listaTarefasHoje = document.getElementById('lista-tarefas-hoje');
const galeriaGratidao = document.getElementById('galeria-gratidao');
const diasContainer = document.getElementById('dias-semana-container');

// Modais
const modalTarefa = document.getElementById('modal-tarefa');
const modalFoto = document.getElementById('modal-foto');
const modalOpcoes = document.getElementById('modal-opcoes-tarefa');
const modalVerFoto = document.getElementById('modal-ver-foto');

// Inputs e botões - Tarefas
const inputTarefaDescricao = document.getElementById('input-tarefa-descricao');
const inputTarefaHorario = document.getElementById('input-tarefa-horario');
const btnCancelarTarefa = document.getElementById('btn-cancelar-tarefa');
const btnSalvarTarefa = document.getElementById('btn-salvar-tarefa');
const btnAddTarefaHoje = document.getElementById('btn-add-tarefa-hoje');

// Inputs e botões - Fotos
const btnAddFoto = document.getElementById('btn-add-foto');
const uploadArea = document.getElementById('upload-area');
const inputFoto = document.getElementById('input-foto');
const inputLegenda = document.getElementById('input-legenda');
const btnCancelarFoto = document.getElementById('btn-cancelar-foto');
const btnSalvarFoto = document.getElementById('btn-salvar-foto');

// Opções da tarefa
const opcaoEditar = document.getElementById('opcao-editar');
const opcaoExcluir = document.getElementById('opcao-excluir');
const opcaoCancelar = document.getElementById('opcao-cancelar');

// Visualização de foto
const fotoExpandida = document.getElementById('foto-expandida');
const fotoLegenda = document.getElementById('foto-legenda');
const btnFecharFoto = document.getElementById('btn-fechar-foto');
const btnDeletarFoto = document.getElementById('btn-deletar-foto');

// ============================================
// 3. ESTADO DO APP
// ============================================

let tarefaEditando = null;
let diaEditando = null;
let fotoEditando = null; // Base64 da foto temporária
let momentoIndexAtual = null;

// ============================================
// 4. INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    atualizarData();
    renderizarTarefasHoje();
    renderizarGratidao();
    renderizarDiasSemana();
    setInterval(atualizarData, 1000);
    
    // Configurar navegação
    configurarNavegacao();
    
    // Configurar modais
    configurarModais();
});

// ============================================
// 5. CONFIGURAÇÕES DE EVENTOS
// ============================================

function configurarNavegacao() {
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
                renderizarDiasSemana();
            }
        });
    });
}

function configurarModais() {
    // Modal de tarefa
    btnAddTarefaHoje.addEventListener('click', () => {
        diaEditando = diasSemana[new Date().getDay()];
        tarefaEditando = null;
        inputTarefaDescricao.value = '';
        inputTarefaHorario.value = '';
        modalTarefa.classList.add('active');
    });
    
    btnCancelarTarefa.addEventListener('click', () => {
        modalTarefa.classList.remove('active');
    });
    
    btnSalvarTarefa.addEventListener('click', salvarTarefa);
    
    // Modal de foto
    btnAddFoto.addEventListener('click', () => {
        inputLegenda.value = '';
        modalFoto.classList.add('active');
    });
    
    uploadArea.addEventListener('click', () => {
        inputFoto.click();
    });
    
    inputFoto.addEventListener('change', handleFotoSelecionada);
    
    btnCancelarFoto.addEventListener('click', () => {
        modalFoto.classList.remove('active');
        fotoEditando = null;
        inputFoto.value = '';
        resetarUploadArea();
    });
    
    btnSalvarFoto.addEventListener('click', salvarMomento);
    
    // Modal de visualização de foto
    btnFecharFoto.addEventListener('click', () => {
        modalVerFoto.classList.remove('active');
    });
    
    btnDeletarFoto.addEventListener('click', deletarMomentoAtual);
    
    // Opções da tarefa
    opcaoCancelar.addEventListener('click', () => {
        modalOpcoes.classList.remove('active');
    });
    
    opcaoEditar.addEventListener('click', () => {
        modalOpcoes.classList.remove('active');
        if (tarefaEditando) {
            inputTarefaDescricao.value = tarefaEditando.descricao;
            inputTarefaHorario.value = tarefaEditando.horario || '';
            modalTarefa.classList.add('active');
        }
    });
    
    opcaoExcluir.addEventListener('click', excluirTarefa);
}

function resetarUploadArea() {
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>clique para selecionar uma foto</p>
    `;
}

// ============================================
// 6. FUNÇÕES DE DATA
// ============================================

function atualizarData() {
    const hoje = new Date();
    const diaSemana = diasSemana[hoje.getDay()];
    const dia = hoje.getDate();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mes = meses[hoje.getMonth()];
    const ano = hoje.getFullYear();
    
    diaTitulo.textContent = diaSemana;
    dataAtual.textContent = `${dia} de ${mes} de ${ano}`;
}

// ============================================
// 7. FUNÇÕES DE TAREFAS
// ============================================

function renderizarTarefasHoje() {
    const hoje = diasSemana[new Date().getDay()];
    const tarefasHoje = tarefas[hoje] || [];
    
    if (tarefasHoje.length === 0) {
        listaTarefasHoje.innerHTML = `
            <div class="gratidao-placeholder" style="aspect-ratio: auto; padding: 24px;">
                <i class="fas fa-sparkles"></i>
                <span>nenhuma tarefa para hoje ✨</span>
            </div>
        `;
        return;
    }
    
    let html = '';
    tarefasHoje.forEach(tarefa => {
        const horarioHtml = tarefa.horario ? 
            `<span class="tarefa-horario"><i class="far fa-clock"></i> ${tarefa.horario}</span>` : '';
        
        html += `
            <div class="tarefa-item" data-id="${tarefa.id}">
                <div class="tarefa-checkbox ${tarefa.concluida ? 'checked' : ''}" 
                     onclick="toggleConcluida('${hoje}', '${tarefa.id}')">
                    ${tarefa.concluida ? '✓' : ''}
                </div>
                <div class="tarefa-conteudo">
                    <span class="tarefa-descricao ${tarefa.concluida ? 'concluida' : ''}">
                        ${tarefa.descricao}
                    </span>
                    ${horarioHtml}
                </div>
                <button class="tarefa-opcoes" onclick="abrirOpcoesTarefa('${hoje}', '${tarefa.id}')">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
            </div>
        `;
    });
    
    listaTarefasHoje.innerHTML = html;
}

window.toggleConcluida = (dia, id) => {
    const tarefa = tarefas[dia].find(t => t.id === id);
    if (tarefa) {
        tarefa.concluida = !tarefa.concluida;
        salvarTarefas();
        renderizarTarefasHoje();
        renderizarDiasSemana();
    }
};

window.abrirOpcoesTarefa = (dia, id) => {
    diaEditando = dia;
    tarefaEditando = tarefas[dia].find(t => t.id === id);
    modalOpcoes.classList.add('active');
};

function salvarTarefa() {
    const descricao = inputTarefaDescricao.value.trim();
    if (!descricao || !diaEditando) return;
    
    if (!tarefas[diaEditando]) {
        tarefas[diaEditando] = [];
    }
    
    if (tarefaEditando) {
        // Editar existente
        tarefaEditando.descricao = descricao;
        tarefaEditando.horario = inputTarefaHorario.value || null;
    } else {
        // Criar nova
        tarefas[diaEditando].push({
            id: Date.now().toString(),
            descricao: descricao,
            horario: inputTarefaHorario.value || null,
            concluida: false
        });
    }
    
    salvarTarefas();
    modalTarefa.classList.remove('active');
    renderizarTarefasHoje();
    renderizarDiasSemana();
}

function excluirTarefa() {
    modalOpcoes.classList.remove('active');
    if (tarefaEditando && diaEditando) {
        const index = tarefas[diaEditando].findIndex(t => t.id === tarefaEditando.id);
        if (index !== -1) {
            tarefas[diaEditando].splice(index, 1);
            salvarTarefas();
            renderizarTarefasHoje();
            renderizarDiasSemana();
        }
    }
}

function renderizarDiasSemana() {
    let html = '';
    
    diasSemana.forEach(dia => {
        const tarefasDia = tarefas[dia] || [];
        let tarefasHtml = '';
        
        if (tarefasDia.length === 0) {
            tarefasHtml = `
                <div style="text-align: center; padding: 12px; color: #b28b98; font-size: 13px;">
                    nenhuma tarefa ✨
                </div>
            `;
        } else {
            tarefasDia.forEach(tarefa => {
                tarefasHtml += `
                    <div class="tarefa-item-dia">
                        <div class="tarefa-info-dia">
                            <div class="tarefa-checkbox-dia ${tarefa.concluida ? 'checked' : ''}"
                                 onclick="toggleConcluida('${dia}', '${tarefa.id}')">
                                ${tarefa.concluida ? '✓' : ''}
                            </div>
                            <span class="tarefa-descricao-dia ${tarefa.concluida ? 'concluida' : ''}">
                                ${tarefa.descricao}
                            </span>
                            ${tarefa.horario ? `<span class="tarefa-horario-dia">${tarefa.horario}</span>` : ''}
                        </div>
                        <button class="tarefa-opcoes" onclick="abrirOpcoesTarefa('${dia}', '${tarefa.id}')">
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
                    <button class="btn-add-tarefa-dia" onclick="abrirAddTarefaDia('${dia}')">
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

window.abrirAddTarefaDia = (dia) => {
    diaEditando = dia;
    tarefaEditando = null;
    inputTarefaDescricao.value = '';
    inputTarefaHorario.value = '';
    modalTarefa.classList.add('active');
};

function salvarTarefas() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// ============================================
// 8. FUNÇÕES DE FOTO (COM COMPRESSÃO, SEM LIMITE)
// ============================================

function handleFotoSelecionada(e) {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        
        // Verificar tamanho (máx 5MB para não travar)
        if (file.size > 5 * 1024 * 1024) {
            alert('A foto é muito grande! Escolha uma com menos de 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            // Comprimir a imagem antes de salvar (qualidade 0.7 = 70%)
            comprimirImagem(event.target.result, 1024, 0.7, (imagemComprimida) => {
                fotoEditando = imagemComprimida;
                
                // Mostrar preview
                uploadArea.innerHTML = `
                    <img src="${imagemComprimida}" style="width: 100%; border-radius: 20px; max-height: 200px; object-fit: contain;">
                `;
            });
        };
        reader.readAsDataURL(file);
    }
}

function comprimirImagem(base64Str, maxWidth, qualidade, callback) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Redimensionar se necessário
        if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Comprimir com qualidade ajustável (0.7 = 70%)
        const imagemComprimida = canvas.toDataURL('image/jpeg', qualidade);
        callback(imagemComprimida);
    };
}

function salvarMomento() {
    if (!fotoEditando) {
        alert('Selecione uma foto!');
        return;
    }
    
    // SEM LIMITE DE FOTOS! Pode adicionar quantas quiser
    
    momentosGratidao.push({
        id: Date.now().toString(),
        foto: fotoEditando,
        legenda: inputLegenda.value.trim() || 'momento especial ✨',
        data: new Date().toISOString()
    });
    
    localStorage.setItem('momentos', JSON.stringify(momentosGratidao));
    
    modalFoto.classList.remove('active');
    fotoEditando = null;
    inputFoto.value = '';
    resetarUploadArea();
    renderizarGratidao();
    
    // Mostrar mensagem de sucesso
    setTimeout(() => {
        alert('✨ Momento salvo com sucesso!');
    }, 100);
}

function renderizarGratidao() {
    // MOSTRA TODAS AS FOTOS em ordem reversa (mais recentes primeiro)
    const fotosReversas = [...momentosGratidao].reverse();
    
    let html = '';
    
    if (fotosReversas.length === 0) {
        // Apenas um placeholder grande para adicionar
        html = `
            <div class="gratidao-placeholder" style="grid-column: span 3; aspect-ratio: 2; padding: 40px;" 
                 onclick="document.getElementById('btn-add-foto').click()">
                <i class="fas fa-camera" style="font-size: 48px;"></i>
                <span style="font-size: 18px;">adicionar primeiro momento</span>
            </div>
        `;
    } else {
        // Mostrar todas as fotos em grid (3 colunas, quantas linhas forem necessárias)
        fotosReversas.forEach((momento, index) => {
            const momentoRealIndex = momentosGratidao.length - 1 - index;
            html += `
                <div class="gratidao-item" onclick="verMomento(${momentoRealIndex})">
                    <img src="${momento.foto}" alt="Momento especial" loading="lazy">
                    <div class="legenda-preview">${momento.legenda || '✨'}</div>
                </div>
            `;
        });
        
        // Botão para adicionar mais (ocupa uma posição no grid)
        html += `
            <div class="gratidao-placeholder" onclick="document.getElementById('btn-add-foto').click()">
                <i class="fas fa-plus"></i>
                <span>adicionar</span>
            </div>
        `;
    }
    
    galeriaGratidao.innerHTML = html;
}

window.verMomento = (index) => {
    if (index >= 0 && index < momentosGratidao.length) {
        const momento = momentosGratidao[index];
        fotoExpandida.src = momento.foto;
        fotoLegenda.textContent = momento.legenda;
        momentoIndexAtual = index;
        modalVerFoto.classList.add('active');
    }
};

function deletarMomentoAtual() {
    if (momentoIndexAtual !== null && momentoIndexAtual >= 0 && momentoIndexAtual < momentosGratidao.length) {
        momentosGratidao.splice(momentoIndexAtual, 1);
        localStorage.setItem('momentos', JSON.stringify(momentosGratidao));
        modalVerFoto.classList.remove('active');
        renderizarGratidao();
        momentoIndexAtual = null;
    }
}

// ============================================
// 9. VERIFICAÇÃO DE ESPAÇO (OPCIONAL)
// ============================================

function verificarEspacoLocalStorage() {
    try {
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length * 2; // Aproximado em bytes
            }
        }
        
        // Se estiver próximo do limite (5MB), avisar
        if (totalSize > 4.5 * 1024 * 1024) {
            console.warn('LocalStorage quase cheio! Considere remover fotos antigas.');
        }
    } catch (e) {
        console.log('Não foi possível verificar espaço');
    }
}

// Chamar periodicamente
setInterval(verificarEspacoLocalStorage, 60000);

// ============================================
// FIM DO SCRIPT
// ============================================
