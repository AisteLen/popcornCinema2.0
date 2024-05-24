export let isAdmin = false;

export function allMoviesForAdmin() {
    const loginLobby = document.getElementById("loginLobby");
    const allMovies = document.getElementById("allMovies");
    const addMovieBtn = document.getElementById("addMovie");
    const newMovie = document.getElementById("newMovie");

    loginLobby.className = "d-none";
    allMovies.className = "d-block";
    addMovieBtn.className = "d-block";
    newMovie.className = "d-none";
    isAdmin = true;
    toggleDeleteButtons();
    updateAdminControls();
}

export function toggleDeleteButtons() {
    const deleteMovieButtons = document.querySelectorAll(".deleteMovie");
    deleteMovieButtons.forEach(btn => {
        btn.style.display = isAdmin ? "block" : "none";
    });
}

export function updateAdminControls() {
    const deleteMovieButtons = document.querySelectorAll(".deleteMovie");
    deleteMovieButtons.forEach(btn => {
        btn.classList.remove("d-none");
        btn.classList.add("d-flex");
    });

    const cancelReservationButtons = document.querySelectorAll(".cancelReservation");
    cancelReservationButtons.forEach(btn => {
        btn.style.display = isAdmin ? "block" : "none";
    });

    document.querySelectorAll(".chair").forEach(chair => {
        chair.addEventListener('click', function() {
            if (isAdmin && chair.classList.contains("reserved")) {
                chair.classList.toggle("toCancelReservation");
                document.querySelectorAll(".cancelReservation").forEach(btn => {
                    btn.style.display = "block";
                });
            }
        });
    });

    document.querySelectorAll(".cancelReservation").forEach(btn => {
        btn.addEventListener('click', function() {
            const reservationWindow = btn.closest(".reservationWindow");
            if (reservationWindow) {
                const movieTitle = reservationWindow.querySelector(".infoSide div").textContent.split(": ")[1].trim();
                const seatsContainer = reservationWindow.querySelector(".seats");
                seatsContainer.querySelectorAll(".chair.toCancelReservation").forEach(chair => {
                    chair.classList.remove("reserved", "toCancelReservation");
                });
                saveReservations(movieTitle, seatsContainer);
            }
        });
    });
}


export function resetAdminState() {
    isAdmin = false;
    const deleteMovieButtons = document.querySelectorAll(".deleteMovie");
    deleteMovieButtons.forEach(btn => {
        btn.style.display = "none";
    });
    const cancelReservationButtons = document.querySelectorAll(".cancelReservation");
    cancelReservationButtons.forEach(btn => {
        btn.style.display = "none";
    });
}

export function saveReservations(movieTitle, seatsContainer) {
    const reservedSeats = [];
    seatsContainer.querySelectorAll(".chair").forEach((chair, index) => {
        if (chair.classList.contains("reserved")) {
            reservedSeats.push(index);
        }
    });

    const reservations = JSON.parse(localStorage.getItem("reservations")) || {};
    reservations[movieTitle] = reservedSeats;
    localStorage.setItem("reservations", JSON.stringify(reservations));

    const movies = JSON.parse(localStorage.getItem("movies")) || [];
    const movie = movies.find(m => m.title === movieTitle);
    if (movie) {
        movie.reservedSeats = reservedSeats;
        localStorage.setItem("movies", JSON.stringify(movies));
    }

    updateSeatsInfo(movieTitle);
}

export function updateSeatsInfo(movieTitle) {
    const movies = JSON.parse(localStorage.getItem("movies")) || [];
    const movie = movies.find(m => m.title === movieTitle);
    if (movie) {
        const movieCard = [...document.querySelectorAll(".movie")].find(card => card.dataset.title === movieTitle);
        if (movieCard) {
            const seatsInfo = movieCard.querySelector(".seats-info");
            if (seatsInfo) {
                const availableSeats = movie.seats - movie.reservedSeats.length;
                seatsInfo.innerHTML = `<strong>Seats available:</strong> ${availableSeats} / ${movie.seats}`;
            }
        }
    }
}
