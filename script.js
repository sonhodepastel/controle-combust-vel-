document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const alert = document.getElementById('alert');
    const notificationSound = new Audio('notification.mp3');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

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
        checkForAlerts();
    };

    transactions.forEach(addTransactionToDOM);
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
