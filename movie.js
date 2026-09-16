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
const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
// console.log(movieId);

const backButton = document.getElementById("backButton");
backButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

async function getMovie(movieId) {
    const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Could not fetch movie information.");
    }
    return await response.json();
}

async function loadMovie() {
    try {
        const [movieData, movieTrailer] = await Promise.all([
            getMovie(movieId),
            getMovieTrailer(movieId)
        ]);
        displayMovie(movieData, movieTrailer);
    } catch (error) {
        console.error(error);
        displayError(error.message);
    }
}
loadMovie();

function displayMovie(movieData, movieTrailer) {
    console.log(movieData);
    document.getElementById("loader").style.display = "none";
    document.title = `${movieData.title}`
    const moviesDetails = document.querySelector(".movieDetails");
    moviesDetails.innerHTML = "";

    const moviePoster = document.createElement("div");
    moviePoster.classList.add("moviePoster");
    const poster = document.createElement("img");
    poster.classList.add("moviePoster");
    if (movieData.poster_path) {
        poster.src = `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
    } else {
        poster.src = "placeholder.jpg";
    }

    const movieInfo = document.createElement("div");
    movieInfo.classList.add("movieInfo");

    const movieTitle = document.createElement("h1");
    movieTitle.textContent = `${movieData.title}`;
    movieTitle.classList.add("movieTitle");

    const movieGenre = document.createElement("p");
    movieGenre.textContent =
        `Genres: ${movieData.genres.map(genre => genre.name).join(", ")}`;
    movieGenre.classList.add("movieGenre");

    const movieRelease = document.createElement("p");
    movieRelease.textContent = `Released on: ${movieData.release_date}`;
    movieRelease.classList.add("releaseDate");

    const movieDesp = document.createElement("p");
    movieDesp.textContent = `${movieData.overview}`;
    movieDesp.classList.add("movieDesp");

    const movieRatingVotes = document.createElement("p");
    movieRatingVotes.textContent = `⭐${movieData.vote_average.toFixed(1)}/10 with ${movieData.vote_count} votes`;
    movieRatingVotes.classList.add("movieRatingVotes");

    movieInfo.appendChild(movieTitle);
    const trailer = createTrailer(movieTrailer);
    if (trailer) {
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
        iframe.width = "560";
        iframe.height = "315";
        iframe.title = `${movieData.title} Trailer`;
        iframe.allowFullscreen = true;
        iframe.frameBorder = "0";
        iframe.allow =
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";

        movieInfo.appendChild(iframe);

        const watchButton = document.createElement("a");
        watchButton.href = `https://www.youtube.com/watch?v=${trailer.key}`;
        watchButton.target = "_blank";
        watchButton.textContent = "▶ Watch Trailer on YouTube";

        movieInfo.appendChild(watchButton);
    }
    else {
        const noTrailer = document.createElement("p");
        noTrailer.textContent = "Trailer not available.";
        noTrailer.style.color = "purple";
        noTrailer.style.fontSize = "1.1rem";
        movieInfo.appendChild(noTrailer);
    }

    movieInfo.appendChild(movieGenre);
    movieInfo.appendChild(movieRelease);
    movieInfo.appendChild(movieDesp);
    movieInfo.appendChild(movieRatingVotes);

    moviePoster.appendChild(poster);
    moviesDetails.appendChild(movieInfo)
    moviesDetails.appendChild(moviePoster);
}

async function getMovieTrailer(movieId) {
    const apiUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error("Could not fetch movie trailer.");
    }
    return await response.json();
}

function createTrailer(movieTrailer) {
    let trailer = movieTrailer.results.find(video =>
        video.type === "Trailer" &&
        video.official &&
        video.site === "YouTube"
    );

    if (!trailer) {
        trailer = movieTrailer.results.find(video =>
            video.type === "Trailer" &&
            video.site === "YouTube"
        );
    }
    return trailer;
}

function displayError(message) {
    document.getElementById("loader").style.display = "none";
    const moviesDetails = document.querySelector(".movieDetails");
    moviesDetails.innerHTML = `
        <h2>${message}</h2>
    `;
}