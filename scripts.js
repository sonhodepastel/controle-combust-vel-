let map;
let marker;
let historico = JSON.parse(localStorage.getItem('historico')) || [];

// Função para pedir permissão para notificações
function pedirPermissaoParaNotificacoes() {
    if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Permissão para notificações concedida.');
            }
        });
    }
}

// Função para enviar notificações
function enviarNotificacao(titulo, corpo) {
    if (Notification.permission === 'granted') {
        new Notification(titulo, { body: corpo });
    }
}

// Função para inicializar o mapa
function initMap(lat, lng) {
    map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    marker = L.marker([lat, lng]).addTo(map)
        .bindPopup('Você está aqui!')
        .openPopup();
}

// Função para atualizar a localização
function updateLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const timestamp = new Date().toLocaleString();

            document.getElementById('localizacao').innerText = `Lat: ${lat}, Long: ${lng}`;
            marker.setLatLng([lat, lng]);
            map.setView([lat, lng], 13);

            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                .then(response => response.json())
                .then(data => {
                    const rua = data.address.road ? data.address.road : "Rua não encontrada";
                    document.getElementById('rua').innerText = rua;

                    // Adicionar ao histórico
                    const novaEntrada = { timestamp, localizacao: `Lat: ${lat}, Long: ${lng}`, rua };
                    historico.push(novaEntrada);
                    localStorage.setItem('historico', JSON.stringify(historico)); // Salvar localmente a cada 15 minutos

                    // Enviar notificação
                    enviarNotificacao('Nova Localização Registrada', `Você está em ${rua}.`);
                });

            navigator.getBattery().then(battery => {
                document.getElementById('bateria').innerText = `${battery.level * 100}%`;
            });

            const data = {
                localizacao: document.getElementById('localizacao').innerText,
                bateria: document.getElementById('bateria').innerText,
                rua: document.getElementById('rua').innerText
            };

            fetch('https://seu-servidor.com/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(response => {
                if (response.ok) {
                    console.log('Dados enviados com sucesso!');
                } else {
                    console.error('Erro ao enviar dados.');
                }
            });
        }, error => {
            console.error('Erro ao obter a localização:', error);
        }, {
            enableHighAccuracy: true, // Alta precisão
            timeout: 5000, // Tempo limite
            maximumAge: 0 // Sem cache
        });
    } else {
        document.getElementById('localizacao').innerText = 'Geolocalização não suportada.';
    }
}

// Função para filtrar histórico por data
function filtrarHistoricoPorData() {
    const dataInicio = new Date(document.getElementById('data-inicio').value);
    const dataFim = new Date(document.getElementById('data-fim').value);

    if (dataInicio && dataFim) {
        const historicoFiltrado = historico.filter(entrada => {
            const dataEntrada = new Date(entrada.timestamp);
            return dataEntrada >= dataInicio && dataEntrada <= dataFim;
        });

        exibirHistorico(historicoFiltrado);
    }
}

// Função para exibir histórico filtrado
function exibirHistorico(historicoFiltrado) {
    const tabela = document.getElementById('historico-tabela');
    tabela.innerHTML = ''; // Limpar tabela
    historicoFiltrado.forEach(entrada => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${entrada.timestamp}</td>
            <td>${entrada.localizacao}</td>
            <td>${entrada.rua}</td>
        `;
        tabela.appendChild(linha);
    });

    document.getElementById('historico').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    pedirPermissaoParaNotificacoes();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            initMap(lat, lng);
            updateLocation();
            setInterval(updateLocation, 900000); // Atualiza a cada 15 minutos

            document.getElementById('mover-mapa').addEventListener('click', () => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(position => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        map.setView([lat, lng], 13);
                        marker.setLatLng([lat, lng]);
                        marker.bindPopup('Você está aqui!').openPopup();
                    });
                }
            });

            document.getElementById('filtrar-historico').addEventListener('click', filtrarHistoricoPorData);
        });
    } else {
        document.getElementById('localizacao').innerText = 'Geolocalização não suportada.';
    }
});