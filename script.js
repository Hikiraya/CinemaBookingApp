// Функции для получения, сохранения и обновления данных локального хранилища
function loadSessions() {
    return JSON.parse(localStorage.getItem('sessions')) || {};
}

function saveSessions(sessions) {
    localStorage.setItem('sessions', JSON.stringify(sessions));
}

// Инициализация приложения
$(document).ready(function() {
    const today = new Date();
    const maxBookingDate = new Date();
    const minBookingDate = new Date();
    maxBookingDate.setDate(today.getDate() + 7);
    minBookingDate.setDate(today.getDate() - 7);

    // Установка минимальной и максимальной даты для выбора
    $('#datePicker').attr('min', formatDate(minBookingDate));
    $('#datePicker').attr('max', formatDate(maxBookingDate));
    $('#datePicker').val(formatDate(today));
    
    const sessionsData = loadSessions(); // Загружаем сессии из LocalStorage
    populateSessionOptions();

    // Наполнение `select` со сеансами при изменении даты
    $('#datePicker').on('change', function() {
        const selectedDate = new Date($(this).val());
        populateSessionOptions(selectedDate);
        $('#sessionSelect').val(''); // Убираем выбор по умолчанию
    });

    // Отображение свободных и забронированных мест
    $('#sessionSelect').on('change', function() {
        displaySeats($('#datePicker').val(), $(this).val());
    });

    // Инициализация по умолчанию
    $('#datePicker').trigger('change');
    $('#sessionSelect').trigger('change');
});

// Форматирует дату в YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Заполняет опции сеансов на основе выбранной даты
function populateSessionOptions(selectedDate = new Date()) {
    const options = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const $sessionSelect = $('#sessionSelect');
    $sessionSelect.empty();

    const dateStr = formatDate(selectedDate);
    const currentTime = new Date();

    // Добавляем все сеансы на выбранный день
    options.forEach(session => {
        const sessionTime = new Date(`${dateStr}T${session}:00`);
        // Добавляем все сеансы на выбранный день
        $sessionSelect.append(new Option(session, session, false, false));
    });

    $sessionSelect.val(''); // Убираем выбор по умолчанию
}

// Используйте эту функцию при изменении даты
$('#datePicker').on('change', function() {
    const selectedDate = new Date($(this).val());
    populateSessionOptions(selectedDate);
});

// Проверяет, является ли дата прошедшей
function isPastDate(date) {
    return date < new Date();
}

// Отображает доступные места на основе выбранной даты и сеанса
function displaySeats(dateStr, session) {
    const seats = ['1A', '1B', '1C', '1D', '1E', '2A', '2B', '2C', '2D', '2E'];
    const $seatsContainer = $('#seats');
    $seatsContainer.empty();

    const bookedSeats = getBookedSeats(dateStr, session);

    seats.forEach(seat => {
        const $seatDiv = $('<div class="seat"></div>').text(seat).addClass('available');
        
        if (bookedSeats.includes(seat)) {
            $seatDiv.removeClass('available').addClass('booked').attr('title', 'Забронировано');
        } else if (isPastDate(new Date(dateStr))) {
            $seatDiv.removeClass('available').addClass('archived').attr('title', 'Архивное место');
        } else {
            $seatDiv.on('click', function() {
                bookSeat(dateStr, session, seat);
                $seatDiv.removeClass('available').addClass('booked').attr('title', 'Забронировано');
            });
        }
        
        $seatsContainer.append($seatDiv);
    });
}

// Получить забронированные места для конкретного сеанса
function getBookedSeats(dateStr, session) {
    const sessionsData = loadSessions();
    return sessionsData[`${dateStr} ${session}`] || [];
}

// Зарегистрировать место
function bookSeat(dateStr, session, seat) {
    const sessionsData = loadSessions();
    if (!sessionsData[`${dateStr} ${session}`]) {
        sessionsData[`${dateStr} ${session}`] = [];
    }
    sessionsData[`${dateStr} ${session}`].push(seat);
    saveSessions(sessionsData);
    alert(`Место ${seat} успешно забронировано!`);
}