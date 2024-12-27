document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transaction-form');
    const transactionList = document.getElementById('transaction-list');
    const alert = document.getElementById('alert');

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
    });

    function addTransactionToDOM(transaction) {
        const li = document.createElement('li');
        li.classList.add(transaction.category);
        if (transaction.category === 'despesa' && new Date(transaction.dueDate) < new Date()) {
            li.classList.add('overdue');
        }
        li.innerHTML = `${transaction.description} - R$${transaction.amount.toFixed(2)} - ${transaction.dueDate} <button class="pay" onclick="payTransaction('${transaction.description}')">Pagar</button>`;
        transactionList.appendChild(li);
    }

    function checkForAlerts() {
        const overdueTransactions = transactions.filter(t => t.category === 'despesa' && new Date(t.dueDate) < new Date());
        if (overdueTransactions.length > 0) {
            alert.classList.remove('hidden');
            sendBrowserNotification();
        } else {
            alert.classList.add('hidden');
        }
    }

    function sendBrowserNotification() {
        if (Notification.permission === 'granted') {
            new Notification('Você tem contas atrasadas!');
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Você tem contas atrasadas!');
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
                sendBrowserNotification();
            }
        });
    }, 60000); // Verifica a cada minuto
});
