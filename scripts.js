document.getElementById('recordForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const data = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value;
    const horario = document.getElementById('horario').value;
    let valor = parseFloat(document.getElementById('valor').value);

    if (!data || !descricao || !horario || isNaN(valor)) {
        showMessage('Por favor, preencha todos os campos.', 'red');
        return;
    }

    // Verifica se a descrição contém "Dinheiro" e converte o valor para negativo
    if (descricao.toLowerCase().includes('dinheiro')) {
        valor = -Math.abs(valor);
    }

    const record = { data, descricao, horario, valor: valor.toFixed(2) };

    addRecordToTable(record);
    saveRecord(record);
    updateResumo();
    showMessage('Lançamento adicionado com sucesso!', 'green');
    clearForm();
});

function addRecordToTable(record) {
    const recordsTable = document.getElementById('records');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${record.data}</td>
        <td>${record.descricao}</td>
        <td>${record.horario}</td>
        <td>R$ ${record.valor}</td>
        <td><button onclick="deleteRecord(this)">Excluir</button></td>
    `;

    recordsTable.appendChild(row);
}

function saveRecord(record) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.push(record);
    localStorage.setItem('records', JSON.stringify(records));
}

function deleteRecord(button) {
    const row = button.parentElement.parentElement;
    const data = row.children[0].innerText;
    const descricao = row.children[1].innerText;
    const horario = row.children[2].innerText;
    const valor = row.children[3].innerText.replace('R$ ', '');

    let records = JSON.parse(localStorage.getItem('records')) || [];
    records = records.filter(record => !(record.data === data && record.descricao === descricao && record.horario === horario && record.valor === valor));
    localStorage.setItem('records', JSON.stringify(records));
    row.remove();
    updateResumo();
}

function updateResumo() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    const hoje = new Date().toISOString().split('T')[0];
    const domingo = new Date();
    domingo.setDate(domingo.getDate() - domingo.getDay());

    const ganhosSemana = records.reduce((acc, record) => acc + parseFloat(record.valor), 0).toFixed(2);
    const ganhosHoje = records.filter(record => record.data === hoje)
                               .reduce((acc, record) => acc + parseFloat(record.valor), 0).toFixed(2);
    const ganhosDinheiro = records.filter(record => record.descricao.toLowerCase().includes('dinheiro'))
                                  .reduce((acc, record) => acc + Math.abs(parseFloat(record.valor)), 0).toFixed(2);

    document.getElementById('ganhos-semana').innerText = `Semana: R$ ${ganhosSemana}`;
    document.getElementById('ganhos-hoje').innerText = `Hoje: R$ ${ganhosHoje}`;
    document.getElementById('ganhos-dinheiro').innerText = `Dinheiro: R$ ${ganhosDinheiro}`;

    if (new Date().toLocaleTimeString() === '00:00:00') {
        localStorage.setItem('ganhosHoje', '0.00');
    }

    if (new Date().getDay() === 0 && new Date().toLocaleTimeString() === '00:00:00') {
        const repasseFechado = localStorage.getItem('ganhosSemana');
        alert(`Repasse fechado com valor: R$ ${repasseFechado}`);
        localStorage.setItem('ganhosSemana', '0.00');
    }
}

function clearForm() {
    document.getElementById('recordForm').reset();
}

function showMessage(message, color) {
    const messageElement = document.getElementById('message');
    messageElement.innerText = message;
    messageElement.style.color = color;
}

document.addEventListener('DOMContentLoaded', function() {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.forEach(record => addRecordToTable(record));
    updateResumo();
    setInterval(updateResumo, 60000);  // Atualiza a cada minuto para verificar mudanças de dia
});
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Evita que o mini-infobar apareça no mobile
    e.preventDefault();
    // Guarda o evento para que possa ser disparado mais tarde
    deferredPrompt = e;
    // Atualiza a UI para informar ao usuário que eles podem instalar o PWA
    showInstallPromotion();
});

function showInstallPromotion() {
    const installContainer = document.createElement('div');
    installContainer.className = 'install-container';
    installContainer.innerHTML = `
        <div class="install-prompt">
            <p>Deseja instalar esta aplicação?</p>
            <button id="installButton" class="install-btn">Instalar</button>
        </div>
    `;
    document.body.appendChild(installContainer);

    const installButton = document.getElementById('installButton');
    installButton.addEventListener('click', () => {
        installContainer.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou o prompt de instalação');
            } else {
                console.log('Usuário rejeitou o prompt de instalação');
            }
            deferredPrompt = null;
        });
    });
}