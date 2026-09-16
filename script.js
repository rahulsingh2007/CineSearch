const themeSwitch = document.getElementById("theme-switch");
if (localStorage.getItem("darkmode") === "active") {
    document.body.classList.add("darkmode");
}
themeSwitch.addEventListener("click", () => {
    if (document.body.classList.contains("darkmode")) {
        document.body.classList.remove("darkmode");
        localStorage.removeItem("darkmode");
    } else {
        document.body.classList.add("darkmode");
        localStorage.setItem("darkmode", "active");
    }
});

document.querySelector(".navBar").addEventListener("click", () => {
    window.location.href = "index.html";
});

const apiKey = "0a3559ec7e182828f78966e60022fc1c";
const searchBar = document.querySelector(".searchBar");
const input = document.getElementById("movieSearch");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
let currentPage = 1;
let currentMode = "trending";
let currentSearch = "";
let currentGenre = null;

searchBar.addEventListener("submit", async (event) => {
    event.preventDefault();
    const movieName = input.value.trim();
    if (movieName) {
        try {
            currentMode = "search";
            currentSearch = movieName;
            currentPage = 1;
            await loadCurrentPage();
        } catch (error) {
            console.error(error);
            displayError(error.message);
        }
    } else {
        displayError("Please enter a movie name!");
    }
});

async function searchMovie(movieName, page = 1) {
    const apiUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}&api_key=${apiKey}&page=${page}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Could not fetch movie information.");
    }
    return await response.json();
}

async function getMoviesByGenre(genreId, page = 1) {
    const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Could not fetch movies.");
    }
    return await response.json();
}
const genres = {
    Action: 28,
    Adventure: 12,
    Comedy: 35,
    Crime: 80,
    Drama: 18,
    Horror: 27,
    Music: 10402,
    Mystery: 9648,
    "Sci-Fi": 878,
    Thriller: 53
};
function setupGenreButtons() {
    const genreButtons = document.querySelectorAll(".genrePill");
    genreButtons.forEach(button => {
        button.addEventListener("click", async () => {
            genreButtons.forEach(btn => {
                btn.classList.remove("active");
            });
            button.classList.add("active");
            const genre = button.dataset.genre;
            if (genre === "All") {
                currentMode = "trending";
                currentPage = 1;
                loadTrendingMovies();
            } else {
                const genreId = genres[genre];
                currentMode = "genre";
                currentGenre = genreId;
                currentPage = 1;
                await loadCurrentPage();
            }
            console.log(genre);
        });
    });
}
setupGenreButtons();

previousBtn.addEventListener("click", async () => {
    if (currentPage > 1) {
        currentPage--;
        await loadCurrentPage();
    }
});
function updatePaginationButtons() {
    previousBtn.disabled = currentPage === 1;
}
updatePaginationButtons();
nextBtn.addEventListener("click", async () => {
    currentPage++;
    await loadCurrentPage();
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function displayMovieInfo(data) {
    const moviesContainer = document.querySelector(".movies-container");
    moviesContainer.innerHTML = "";

    if (data.results.length === 0) {
        const queryTerm = currentSearch ? escapeHtml(currentSearch) : "your search";
        moviesContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon-wrap">
                    <span class="no-results-icon" role="img" aria-label="Movie clapper">🎬</span>
                </div>
                <h2 class="no-results-title">No movies found</h2>
                <p class="no-results-sub">We couldn't find anything matching <span class="no-results-query">"${queryTerm}"</span>.</p>
                <p class="no-results-hint">Double-check the spelling or try searching for another title.</p>
                <button type="button" class="no-results-btn" id="resetSearchBtn">Explore Trending Movies</button>
            </div>
        `;
        previousBtn.style.display = "none";
        nextBtn.style.display = "none";

        const resetBtn = document.getElementById("resetSearchBtn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                input.value = "";
                currentSearch = "";
                document.querySelectorAll(".genrePill").forEach(btn => btn.classList.remove("active"));
                const allPill = document.querySelector('.genrePill[data-genre="All"]');
                if (allPill) allPill.classList.add("active");
                loadTrendingMovies();
            });
        }
        return;
    }

    updatePaginationButtons();
    previousBtn.style.display = "";
    nextBtn.style.display = "";

    data.results.forEach(movie => {
        const poster = document.createElement("img");
        poster.classList.add("moviePoster");
        if (movie.poster_path) {
            poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        } else {
            poster.src = "placeholder.jpg";
        }

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.addEventListener("click", event => {
            window.location.href = `movie.html?id=${movie.id}`;
            console.log(movie.id);
        })

        const movieInfo = document.createElement("div");
        movieInfo.classList.add("movie-info");


        const title = document.createElement("h3");
        title.textContent = `${movie.title} (${movie.release_date.slice(0, 4)})`;
        title.classList.add("movieNameRelease");

        const movieRating = document.createElement("p");
        movieRating.textContent = `⭐ ${movie.vote_average.toFixed(1)}/10`;
        movieRating.classList.add("movieRating");

        movieCard.appendChild(poster);
        movieInfo.appendChild(title);
        movieCard.appendChild(movieInfo);
        movieInfo.appendChild(movieRating);
        moviesContainer.appendChild(movieCard);
    });

    console.log(data);
}
async function getTrendingMovies(page) {
    const apiUrl = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apiKey}&page=${page}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("Could not fetch trending movies.");
    }
    return await response.json();
}
async function loadTrendingMovies() {
    currentMode = "trending";
    currentPage = 1;
    await loadCurrentPage();
}
loadTrendingMovies();

async function loadCurrentPage() {
    if (currentMode === "trending") {
        const movies = await getTrendingMovies(currentPage);
        displayMovieInfo(movies);
    }
    else if (currentMode === "search") {
        const movies = await searchMovie(currentSearch, currentPage);
        displayMovieInfo(movies);
    }
    else if (currentMode === "genre") {
        const movies = await getMoviesByGenre(currentGenre, currentPage);
        displayMovieInfo(movies);
    }
}

function displayError(message) {
    const moviesDetails = document.querySelector(".movieDetails");
    moviesDetails.innerHTML = `
        <h2>${message}</h2>
    `;
}