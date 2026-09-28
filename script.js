document.addEventListener('DOMContentLoaded', () => {
    // Единое бургер-меню для всех страниц.
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }

    // Единое модальное окно заказа.
    const modal = document.getElementById('orderModal');

    if (modal) {
        const closeButtons = modal.querySelectorAll('.modal-close, #closeModal, #modalClose');
        const templateInput = document.getElementById('modal-template-input');
        const templateSelect = document.getElementById('template-select');
        const tariffSelect = document.getElementById('tariff-select');

        const openModal = (button) => {
            const template = button.getAttribute('data-template') || '';
            const product = button.getAttribute('data-product') || '';

            // Каждый новый заказ начинается без случайно сохранённого выбора.
            if (templateSelect) templateSelect.value = '';
            if (tariffSelect) tariffSelect.value = '';
            if (templateInput) templateInput.value = '';

            // Кнопка шаблона выбирает только шаблон.
            if (template) {
                if (templateSelect) {
                    const option = [...templateSelect.options].find(o => o.value === template);
                    if (option) templateSelect.value = template;
                }
                if (templateInput) templateInput.value = template;
            }

            // Кнопка тарифа выбирает только тариф — шаблон клиент указывает сам.
            if (product && tariffSelect) {
                const tariff = product.replace(/^Тариф:\s*/, '');
                const option = [...tariffSelect.options].find(o => o.value === tariff || o.textContent.trim() === tariff);
                if (option) tariffSelect.value = option.value;
            }

            modal.classList.add('active');
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
        };

        const closeModal = () => {
            modal.classList.remove('active');
            modal.style.display = '';
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        };

        document.querySelectorAll('.select-btn, .open-order-modal').forEach(button => {
            button.addEventListener('click', event => {
                event.preventDefault();
                openModal(button);
            });
        });

        closeButtons.forEach(button => button.addEventListener('click', closeModal));
        modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && modal.classList.contains('active')) closeModal();
        });
    }

    // FAQ.
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) otherItem.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });
});
