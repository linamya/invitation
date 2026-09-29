document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       LYMI — Cloudflare Worker
       ========================================================= */

    const LYMI_WORKER_URL = 'https://lymiinvitation.awsjfe.workers.dev/';


    /* =========================================================
       БУРГЕР-МЕНЮ
       ========================================================= */

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


    /* =========================================================
       МОДАЛЬНОЕ ОКНО ЗАКАЗА
       ========================================================= */

    const modal = document.getElementById('orderModal');

    if (modal) {

        const closeButtons = modal.querySelectorAll(
            '.modal-close, #closeModal, #modalClose'
        );

        const templateInput =
            document.getElementById('modal-template-input');

        const templateSelect =
            document.getElementById('template-select');

        const tariffSelect =
            document.getElementById('tariff-select');


        /* ---------- Открытие модального окна ---------- */

        const openModal = (button) => {

            const template =
                button.getAttribute('data-template') || '';

            const product =
                button.getAttribute('data-product') || '';


            // Каждый новый заказ начинается с чистого выбора.
            if (templateSelect) {
                templateSelect.value = '';
            }

            if (tariffSelect) {
                tariffSelect.value = '';
            }

            if (templateInput) {
                templateInput.value = '';
            }


            // Если пользователь нажал на кнопку конкретного шаблона —
            // автоматически выбираем этот шаблон.
            if (template) {

                if (templateSelect) {

                    const option = [...templateSelect.options]
                        .find(option => option.value === template);

                    if (option) {
                        templateSelect.value = template;
                    }
                }

                if (templateInput) {
                    templateInput.value = template;
                }
            }


            // Если пользователь нажал на кнопку тарифа —
            // автоматически выбираем тариф.
            if (product && tariffSelect) {

                const tariff =
                    product.replace(/^Тариф:\s*/, '');

                const option = [...tariffSelect.options]
                    .find(option =>
                        option.value === tariff ||
                        option.textContent.trim() === tariff
                    );

                if (option) {
                    tariffSelect.value = option.value;
                }
            }


            modal.classList.add('active');
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');

            document.body.classList.add('modal-open');
        };


        /* ---------- Закрытие модального окна ---------- */

        const closeModal = () => {

            modal.classList.remove('active');

            modal.style.display = '';

            modal.setAttribute('aria-hidden', 'true');

            document.body.classList.remove('modal-open');
        };


        /* ---------- Кнопки открытия ---------- */

        document
            .querySelectorAll('.select-btn, .open-order-modal')
            .forEach(button => {

                button.addEventListener('click', event => {

                    event.preventDefault();

                    openModal(button);
                });
            });


        /* ---------- Кнопки закрытия ---------- */

        closeButtons.forEach(button => {
            button.addEventListener('click', closeModal);
        });


        /* ---------- Закрытие по клику вне окна ---------- */

        modal.addEventListener('click', event => {

            if (event.target === modal) {
                closeModal();
            }
        });


        /* ---------- Закрытие по Escape ---------- */

        document.addEventListener('keydown', event => {

            if (
                event.key === 'Escape' &&
                modal.classList.contains('active')
            ) {
                closeModal();
            }
        });


        /* =====================================================
           ОТПРАВКА МОДАЛЬНОЙ ФОРМЫ
           ===================================================== */

        const modalForm =
            document.getElementById('orderModalForm');

        if (modalForm) {
            setupLymiForm(modalForm, closeModal);
        }
    }


    /* =========================================================
       ОСНОВНАЯ ФОРМА НА СТРАНИЦЕ
       ========================================================= */

    const mainForm = document.querySelector(
        'form[data-lymi-order-form]'
    );

    if (mainForm) {
        setupLymiForm(mainForm);
    }


    /* =========================================================
       FAQ
       ========================================================= */

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {

        const question =
            item.querySelector('.faq-question');

        if (!question) return;


        question.addEventListener('click', () => {

            faqItems.forEach(otherItem => {

                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            item.classList.toggle('active');
        });
    });


    /* =========================================================
       ФУНКЦИЯ ОТПРАВКИ ЗАЯВКИ
       ========================================================= */

    function setupLymiForm(form, onSuccess) {

        if (!form) return;


        form.addEventListener('submit', async event => {

            event.preventDefault();


            /* -------------------------------------------------
               Защита от повторного нажатия
               ------------------------------------------------- */

            if (form.dataset.sending === 'true') {
                return;
            }

            form.dataset.sending = 'true';


            /* -------------------------------------------------
               Кнопка отправки
               ------------------------------------------------- */

            const submitButton =
                form.querySelector('button[type="submit"]');

            const buttonText =
                submitButton
                    ? submitButton.querySelector('span')
                    : null;


            const originalButtonText =
                buttonText
                    ? buttonText.textContent
                    : submitButton
                        ? submitButton.textContent
                        : 'Отправить заявку';


            if (submitButton) {
                submitButton.disabled = true;
            }

            if (buttonText) {
                buttonText.textContent = 'Отправляем…';
            }


            /* -------------------------------------------------
               Убираем старое сообщение
               ------------------------------------------------- */

            const oldStatus =
                form.querySelector('.lymi-form-status');

            if (oldStatus) {
                oldStatus.remove();
            }


            /* -------------------------------------------------
               Получаем данные формы
               ------------------------------------------------- */

            const formData = new FormData(form);


            const payload = {

                name:
                    formData.get('name') || '',

                contact:
                    formData.get('contact') ||
                    formData.get('contact_handle') ||
                    '',

                messenger:
                    formData.get('messenger') || '',

                tariff:
                    formData.get('tariff') || '',

                template:
                    formData.get('template') || '',

                message:
                    formData.get('message') || ''
            };


            /* -------------------------------------------------
               Отправляем в Cloudflare Worker
               ------------------------------------------------- */

            try {

                const response = await fetch(
                    LYMI_WORKER_URL,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify(payload)
                    }
                );


                let result = {};

                try {
                    result = await response.json();
                } catch (error) {
                    result = {};
                }


                /* -------------------------------------------------
                   Проверяем результат
                   ------------------------------------------------- */

                if (!response.ok || !result.ok) {

                    throw new Error(
                        result.error ||
                        'Не удалось отправить заявку'
                    );
                }


                /* -------------------------------------------------
                   УСПЕШНАЯ ОТПРАВКА
                   ------------------------------------------------- */

                showFormStatus(
                    form,
                    'success',
                    '✓ Заявка отправлена! Спасибо ❤️ Я свяжусь с вами в ближайшее время.'
                );


                /* -------------------------------------------------
                   Очищаем форму
                   ------------------------------------------------- */

                form.reset();


                /* -------------------------------------------------
                   Закрываем модальное окно
                   ------------------------------------------------- */

                if (typeof onSuccess === 'function') {

                    setTimeout(() => {
                        onSuccess();
                    }, 1800);
                }


                /* -------------------------------------------------
                   Возвращаем кнопку
                   ------------------------------------------------- */

                setTimeout(() => {

                    if (submitButton) {
                        submitButton.disabled = false;
                    }

                    if (buttonText) {
                        buttonText.textContent =
                            originalButtonText;
                    }

                    form.dataset.sending = 'false';

                }, 1800);


            } catch (error) {

                console.error(
                    'LYMI form error:',
                    error
                );


                /* -------------------------------------------------
                   ОШИБКА
                   ------------------------------------------------- */

                showFormStatus(
                    form,
                    'error',
                    'Не удалось отправить заявку. Попробуйте ещё раз.'
                );


                /* -------------------------------------------------
                   Возвращаем кнопку
                   ------------------------------------------------- */

                if (submitButton) {
                    submitButton.disabled = false;
                }

                if (buttonText) {
                    buttonText.textContent =
                        originalButtonText;
                }

                form.dataset.sending = 'false';
            }

        });
    }


    /* =========================================================
       СООБЩЕНИЕ ОТПРАВКИ
       ========================================================= */

    function showFormStatus(form, type, message) {

        const status =
            document.createElement('div');


        status.className =
            'lymi-form-status lymi-form-status-' + type;


        status.textContent = message;


        status.setAttribute('role', 'status');


        const button =
            form.querySelector('button[type="submit"]');


        if (button) {

            button.insertAdjacentElement(
                'afterend',
                status
            );

        } else {

            form.appendChild(status);
        }


        /* -------------------------------------------------
           Стили сообщения
           ------------------------------------------------- */

        status.style.marginTop = '16px';
        status.style.padding = '12px 16px';
        status.style.borderRadius = '10px';
        status.style.fontSize = '14px';
        status.style.lineHeight = '1.5';
        status.style.textAlign = 'center';


        if (type === 'success') {

            status.style.background =
                'rgba(214, 166, 77, 0.12)';

            status.style.border =
                '1px solid rgba(214, 166, 77, 0.35)';

            status.style.color =
                '#D6A64D';

        } else {

            status.style.background =
                'rgba(180, 60, 60, 0.12)';

            status.style.border =
                '1px solid rgba(180, 60, 60, 0.35)';

            status.style.color =
                '#c96b6b';
        }


        /* -------------------------------------------------
           Убираем сообщение через несколько секунд
           ------------------------------------------------- */

        setTimeout(() => {

            if (status && status.parentNode) {
                status.remove();
            }

        }, 6000);
    }

});
