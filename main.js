import { allMoviesForAdmin, toggleDeleteButtons, updateAdminControls, saveReservations, updateSeatsInfo, resetAdminState } from './admin.js';

document.addEventListener("DOMContentLoaded", function() {
    initializeLocalStorage();
    loadMoviesFromLocalStorage();
    toggleDeleteButtons();
});

const loginLobby = document.getElementById("loginLobby");
const allMovies = document.getElementById("allMovies");
const logOutBtn = document.getElementById("logOut");
const regularUser = document.getElementById("regularUser");
const admin = document.getElementById("admin");
const addMovieBtn = document.getElementById("addMovie");
const newMovie = document.getElementById("newMovie");
const movieTitleInput = document.getElementById("movieTitle");
const movieImageInput = document.getElementById("movieImage");
const seatsTotal = document.getElementById("seatsTotal");
const createMovieBtn = document.getElementById("createMovie");
const movieList = document.getElementById("movieList");
const goToMoviesListBtn = document.getElementById("goToMoviesList");

admin.onclick = () => {
    allMoviesForAdmin();
}

addMovieBtn.onclick = () => {
    allMovies.className = "d-none";
    newMovie.className = "d-flex";
}

logOutBtn.onclick = () => {
    loginLobby.className = "d-flex";
    allMovies.className = "d-none";
    addMovieBtn.className = "d-none";
    resetAdminState(); // Reset admin state when logging out
}

goToMoviesListBtn.onclick = () => {
    allMoviesForAdmin();
}

createMovieBtn.onclick = () => {
    if (seatsTotal.value < 10 || seatsTotal.value > 30) {
       return alert("You can choose  10 to 30 seats")
    }
    const existingMovies = JSON.parse(localStorage.getItem("movies")) || [];
    // Check if a movie with the same title already exists
    const movieTitleExists = existingMovies.some(movie => movie.title === movieTitleInput.value.trim());

    if (movieTitleExists) {
        return alert("This movie already exists");
    }
    if (movieTitleInput.value && movieImageInput.value && seatsTotal.value) {
        const totalSeats = parseInt(seatsTotal.value);
        const newMovie = {
            title: movieTitleInput.value,
            image: movieImageInput.value,
            seats: totalSeats,
            reservedSeats: []
        };

        const newMovieCard = document.createElement("div");
        newMovieCard.className = "movie";
        newMovieCard.innerHTML = `
        <img src="${newMovie.image}" alt="${newMovie.title}">
        <div><strong>Title:</strong> ${newMovie.title}</div>
        <div class="seats-info"><strong>Seats available:</strong> ${totalSeats} / ${totalSeats}</div>
        <button class="deleteMovie d-flex">Delete</button>
        `;
        newMovieCard.dataset.title = newMovie.title;  // Add a data attribute to identify the movie
        movieList.appendChild(newMovieCard);

        saveMoviesToLocalStorage();

        movieTitleInput.value = "";
        movieImageInput.value = "";
        seatsTotal.value = "";

        updateAdminControls();
    } else {
        alert("Please fill all of the boxes");
    }
};

regularUser.onclick = () => {
    loginLobby.className = "d-none";
    allMovies.className = "d-block";
    const cancelReservationButtons = document.querySelectorAll(".cancelReservation");
    cancelReservationButtons.forEach(btn => {
        btn.classList.remove("d-flex");
        btn.classList.add("d-none");
    });
    resetAdminState(); // Reset admin state when logging in as a regular user
}

movieList.addEventListener("click", function(event) {
    if (event.target.classList.contains("deleteMovie")) {
        event.target.closest(".movie").remove();
        saveMoviesToLocalStorage();
    }
});

function loadMoviesFromLocalStorage() {
    const movies = JSON.parse(localStorage.getItem("movies")) || [];
    movies.forEach(movie => {
        const newMovieCard = document.createElement("div");
        const availableSeats = movie.seats - movie.reservedSeats.length;
        newMovieCard.className = "movie";
        newMovieCard.innerHTML = `
        <img src="${movie.image}" alt="${movie.title}">
        <div><strong>Title:</strong> ${movie.title}</div>
        <div><strong>Seats available:</strong> ${availableSeats} / ${movie.seats}</div>
        <button class="deleteMovie d-flex">Delete</button>
        `;
        newMovieCard.dataset.title = movie.title;
        movieList.appendChild(newMovieCard);
    });
}

function saveMoviesToLocalStorage() {
    const movies = [];
    const movieElements = document.querySelectorAll(".movie");
    movieElements.forEach(movieElement => {
        const movieTitle = movieElement.querySelector("div strong").nextSibling.textContent.trim();
        const movieImage = movieElement.querySelector("img").src;
        const seatsInfo = movieElement.querySelector("div:nth-of-type(2)").textContent.split(": ")[1].split(" / ");
        const totalSeats = parseInt(seatsInfo[1].trim());
        const reservedSeats = JSON.parse(localStorage.getItem("reservations"))[movieTitle] || [];
        movies.push({ title: movieTitle, image: movieImage, seats: totalSeats, reservedSeats });
    });
    localStorage.setItem("movies", JSON.stringify(movies));
}

movieList.addEventListener("click", function(event) {
    if (event.target.closest(".movie") && !event.target.classList.contains("deleteMovie")) {
        const movieElement = event.target.closest(".movie");
        const movieTitle = movieElement.dataset.title;
        const movie = JSON.parse(localStorage.getItem("movies")).find(m => m.title === movieTitle);
        const movieImage = movie.image;
        const totalSeats = movie.seats;
        const reservedSeats = movie.reservedSeats;

        const reservationWindow = document.createElement("div");
        reservationWindow.className = "reservationWindow";
        reservationWindow.innerHTML = `
            <div class="flex1 text-center">
                <img src="${movieImage}" alt="${movieTitle}">
            </div>
            <div class="flex2 direction-col infoSide d-flex">
                <div>Title: ${movieTitle}</div>
                <div class="seats d-flex flex-wrap"></div>
                <button class="reserveSeat">Reserve a seat(s)</button>
                <button class="cancelReservation d-none">Cancel reservation</button>
                <button class="goBack">Go Back</button>
            </div>
        `;

        const seatsContainer = reservationWindow.querySelector('.seats');
        for (let i = 0; i < totalSeats; i++) {
            const chair = document.createElement("div");
            chair.className = "chair";
            if (reservedSeats.includes(i)) {
                chair.classList.add("reserved");
            }
            seatsContainer.appendChild(chair);
            chair.addEventListener('click', function() {
                chair.classList.toggle("active");
            });
        }

        const goBack = reservationWindow.querySelector(".goBack");
        goBack.addEventListener("click", function() {
            document.body.removeChild(reservationWindow);
        });

        const reserveSeat = reservationWindow.querySelector(".reserveSeat");
        reserveSeat.addEventListener("click", function() {
            seatsContainer.querySelectorAll(".chair.active").forEach(chair => {
                chair.classList.remove("active");
                chair.classList.add("reserved");
            });
            saveReservations(movieTitle, seatsContainer);
            updateSeatsInfo(movieTitle);
        });

        const cancelReservation = reservationWindow.querySelector(".cancelReservation");
        cancelReservation.addEventListener("click", function() {
            seatsContainer.querySelectorAll(".chair.toCancelReservation").forEach(chair => {
                chair.classList.remove("reserved", "toCancelReservation");
            });
            saveReservations(movieTitle, seatsContainer);
            updateSeatsInfo(movieTitle);
        });

        document.body.appendChild(reservationWindow);
        updateAdminControls();
    }
});

function initializeLocalStorage() {
    if (!localStorage.getItem("movies")) {
        localStorage.setItem("movies", JSON.stringify([]));
    }
    if (!localStorage.getItem("reservations")) {
        localStorage.setItem("reservations", JSON.stringify({}));
    }
}