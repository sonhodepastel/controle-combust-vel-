if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registrado com sucesso:', registration);
        }).catch(error => {
            console.log('Falha ao registrar o ServiceWorker:', error);
        });
    });
}
