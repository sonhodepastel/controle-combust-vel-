if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha no registro do Service Worker:', error);
            });
    });
}

let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';

    installButton.addEventListener('click', () => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Usuário aceitou a instalação do PWA');
            } else {
                console.log('Usuário dispensou a instalação do PWA');
            }
            deferredPrompt = null;
        });
    });
});

function adicionarEntrega() {
    const cliente = document.getElementById('cliente').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const codigo = document.getElementById('codigo').value.trim();

    if (!cliente || !endereco || !codigo) {
        document.getElementById('alerta').classList.remove('hidden');
        return;
    }

    const entrega = { cliente, endereco, codigo };
    entregas.push(entrega);
    localStorage.setItem('entregas', JSON.stringify(entregas));

    alert('Entrega adicionada com sucesso!');
    document.getElementById('alerta').classList.add('hidden');
    atualizarTabela();
    limparCampos();
}

function exportarCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Nome do Cliente,Endereço Completo,Código de Entrega\n";
    entregas.forEach(entrega => {
        csvContent += `${entrega.cliente},${entrega.endereco},${entrega.codigo}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link =[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/ricardo-cas/pandas/tree/eefd8f3ed9250c15e029b7ae59a24ef9f7ffc4ab/GUIA_MARKDOWN.MD?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "1")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/greysonkirk/OfflineBudget/tree/12e332579a3d893effdaeaaddc416949c29b3d49/README.md?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "2")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/ra-md/simple-pwa/tree/c1c81450cd23e8553a254906be0546e6921454f3/service-worker.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "3")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/irfanfadilah/xpense/tree/e4ab2776c4c55f9cb200f833402e4f575ee05b39/service-worker.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "4")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/renyamizuno/pwa_test/tree/1e1769f56bff787ff1d7bb7fec19160f79df80ce/sw.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "5")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/huawillian/emsi/tree/717e4d6b9f08ad03c2628ecded6aac70a1dc924d/service-worker.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "6")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/JackieLJM/books-code/tree/db8fb8d95b50e17c047a7181b4aff1f91c6f127f/Progressive-Web-Apps-with-React%2Fmaster%2Fpublic%2Ffirebase-messaging-sw.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "7")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/JohnBinning/jetFuel/tree/e53c30f1373937c9c37baf02fd8e895d9aed0dce/public%2Fservice_worker.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "8")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/Domi04151309/UntitledGame/tree/f926b94b4c9e5f7ff114e87fc8987b4bd7bfe3fd/sw.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "9")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/juac08/CovidTracker/tree/0f1a299e671b082c190745033812dd1ff7e38779/public%2Fworker.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "10")[43dcd9a7-70db-4a1f-b0ae-981daa162054](https://github.com/BMVAK/web-2/tree/78a786012684a7ecbe1de4078cc423eccb739452/src%2Fcontent%2Fen%2Filt%2Fpwa%2Flab-caching-files-with-service-worker.md?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "11")