class BookstoreFrontend {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000/api';
        this.init();
    }

    init() {
        document.getElementById('getBooksBtn').addEventListener('click', () => this.fetchBooks());
        document.getElementById('addBookBtn').addEventListener('click', () => this.addBook());
    }

    showMessage(text, type = 'success') {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    async fetchBooks() {
        try {
            this.showMessage('⌛ Завантаження книг...', 'success');

            const response = await fetch(`${this.apiBaseUrl}/books/`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const books = await response.json();
            this.displayBooks(books);
            this.showMessage(`✅ Успішно отримано ${books.length} книг`, 'success');

        } catch (error) {
            console.error('CORS Error:', error);
            this.showMessage(`❌ Помилка CORS: ${error.message}`, 'error');
        }
    }

    displayBooks(books) {
        const container = document.getElementById('booksContainer');
        const countEl = document.getElementById('booksCount');

        countEl.textContent = books.length;

        if (books.length === 0) {
            container.innerHTML = '<div class="empty-state">Книг не знайдено. Додайте першу книгу!</div>';
            return;
        }

        container.innerHTML = books.map(book => `
            <div class="book-item">
                <div class="book-title">${book.title}</div>
                <div class="book-details">
                    <strong>Автор:</strong> ${book.author_name || 'Невідомо'} | 
                    <strong>Видавництво:</strong> ${book.publisher_name || 'Невідомо'} | 
                    <strong>Ціна:</strong> ${book.price} грн
                </div>
                ${book.description ? `<p>${book.description}</p>` : ''}
            </div>
        `).join('');
    }

    async addBook() {
        try {
            // Спочатку перевіримо, чи є автор та видавництво
            const authorsResponse = await fetch(`${this.apiBaseUrl}/authors/`);
            const publishersResponse = await fetch(`${this.apiBaseUrl}/publishers/`);

            const authors = await authorsResponse.json();
            const publishers = await publishersResponse.json();

            if (authors.length === 0 || publishers.length === 0) {
                this.showMessage('❌ Спочатку створіть автора та видавництво через адмінку Django!', 'error');
                return;
            }

            const newBook = {
                title: `Тестова книга ${new Date().toLocaleTimeString()}`,
                description: 'Це тестова книга для демонстрації CORS',
                price: (Math.random() * 200 + 50).toFixed(2),
                author: authors[0].id,
                publisher: publishers[0].id
            };

            const response = await fetch(`${this.apiBaseUrl}/books/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBook)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.showMessage('✅ Книгу успішно додано!', 'success');
            this.fetchBooks(); // Оновити список

        } catch (error) {
            console.error('Error adding book:', error);
            this.showMessage(`❌ Помилка при додаванні книги: ${error.message}`, 'error');
        }
    }
}

// Запуск додатку при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    new BookstoreFrontend();
});