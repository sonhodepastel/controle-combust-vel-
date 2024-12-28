document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const alert = document.getElementById('alert');
    const notificationSound = new Audio('notification.mp3');
    const ctxBar = document.getElementById('transaction-chart').getContext('2d');
    const ctxPie = document.getElementById('pie-chart').getContext('2d');
    const ctxLine = document.getElementById('line-chart').getContext('2d');
    const searchInput = document.getElementById('search');
    const filterCategory = document.getElementById('filter-category');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    const barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Receitas e Despesas',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1
            }]
        }
    });

    const lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Saldo ao Longo do Tempo',
                data: [],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const dueDate = document.getElementById('due-date').value;
        const category = document.getElementById('category').value;

        const transaction = { description, amount, dueDate, category, date: new Date().toISOString() };
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));

        addTransactionToDOM(transaction);
        updateCharts();
        form.reset();
        checkForAlerts();
        sendBrowserNotification(`Nova ${category}`, `Descrição: ${description}, Valor: R$${amount.toFixed(2)}`);
    });

    function addTransactionToDOM(transaction) {
        const li = document.createElement('li');
        li.classList.add(transaction.category);
        if (transaction.category === 'despesa' && new Date(transaction.dueDate) < new Date()) {
            li.classList.add('overdue');
        }
        li.innerHTML = `
            ${transaction.description} - R$${transaction.amount.toFixed(2)} - ${transaction.dueDate}
            <button class="pay" onclick="payTransaction('${transaction.description}')">Pagar</button>
            <div class="details">
                <p>Data: ${transaction.date}</p>
                <p>Categoria: ${transaction.category}</p>
            </div>
        `;
        li.addEventListener('click', () => {
            const details = li.querySelector('.details');
            details.style.display = details.style.display === 'none' ? 'block' : 'none';
        });
        transactionList.appendChild(li);
    }

    function updateCharts() {
        const labels = transactions.map(t => t.description);
        const data = transactions.map(t => t.amount);
        const backgroundColor = transactions.map(t => t.category === 'receita' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(255, 99, 132, 0.2)');
        const borderColor = transactions.map(t => t.category === 'receita' ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)');

        barChart.data.labels = labels;
        barChart.data.datasets[0].data = data;
        barChart.data.datasets[0].backgroundColor = backgroundColor;
        barChart.data.datasets[0].borderColor = borderColor;
        barChart.update();

        const totalReceitas = transactions.filter(t => t.category === 'receita').reduce((sum, t) => sum + t.amount, 0);
        const totalDespesas = transactions.filter(t => t.category === 'despesa').reduce((sum, t) => sum + t.amount, 0);

        pieChart.data.datasets[0].data = [totalReceitas, totalDespesas];
        pieChart.update();

        const saldoAoLongoDoTempo = transactions.reduce((acc, t) => {
            const lastSaldo = acc.length > 0 ? acc[acc.length - 1] : 0;
            return [...acc, lastSaldo + (t.category === 'receita' ? t.amount : -t.amount)];
        }, []);

        lineChart.data.labels = transactions.map(t => t.date);
        lineChart.data.datasets[0].data = saldoAoLongoDoTempo;
        lineChart.update();

        document.getElementById('total-receitas').textContent = `R$${totalReceitas.toFixed(2)}`;
        document.getElementById('total-despesas').textContent = `R$${totalDespesas.toFixed(2)}`;
        document.getElementById('saldo').textContent = `R$${(totalReceitas - totalDespesas).toFixed(2)}`;
    }

    function checkForAlerts() {
        const overdueTransactions = transactions.filter(t => t.category === 'despesa' && new Date(t.dueDate) < new Date());
        if (overdueTransactions.length > 0) {
            alert.classList.remove('hidden');
            sendBrowserNotification('Contas atrasadas!', 'Você tem contas atrasadas!');
        } else {
            alert.classList.add('hidden');
        }
    }

     function sendBrowserNotification(title, body) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body });
            notificationSound.play();
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body });
                    notificationSound.play();
                }
            });
        }
    }

    window.payTransaction = function(description) {
        transactions = transactions.filter(t => t.description !== description);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        transactionList.innerHTML = '';
        transactions.forEach(addTransactionToDOM);
        updateCharts();
        checkForAlerts();
    };

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTransactions = transactions.filter(t => t.description.toLowerCase().includes(searchTerm));
        transactionList.innerHTML = '';
        filteredTransactions.forEach(addTransactionToDOM);
    });

    filterCategory.addEventListener('change', () => {
        const category = filterCategory.value;
        const filteredTransactions = category === 'todas' ? transactions : transactions.filter(t => t.category === category);
        transactionList.innerHTML = '';
        filteredTransactions.forEach(addTransactionToDOM);
    });

    transactions.forEach(addTransactionToDOM);
    updateCharts();
    checkForAlerts();

    setInterval(() => {
        transactions.forEach(transaction => {
            if (transaction.category === 'despesa' && new Date(transaction.dueDate) < new Date()) {
                sendBrowserNotification('Contas atrasadas!', 'Você tem contas atrasadas!');
            }
        });
    }, 30000); // Verifica a cada 30 segundos

    // Registrar o Service Worker para cache
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker de cache registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker de cache:', error);
            });

        // Registrar o Service Worker para notificações
        navigator.serviceWorker.register('/notification-worker.js')
            .then(registration => {
                console.log('Service Worker de notificações registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha ao registrar o Service Worker de notificações:', error);
            });
    }
});
