import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from 'react-bootstrap/Card';

const FilterBar = ({ filters, handleChange, handleSubmit }) => {
    return (
        <form className="filter-bar" onSubmit={handleSubmit}>
            <select name="genre" value={filters.genre} onChange={handleChange}>
                <option value="">All Genres</option>
                <option value="10759">Action & Adventure</option>
                <option value="16">Animation</option>
                <option value="35">Comedy</option>
                <option value="80">Crime</option>
                <option value="99">Documentary</option>
                <option value="18">Drama</option>
                <option value="10751">Family</option>
                <option value="10762">Kids</option>
                <option value="9648">Mystery</option>
                <option value="10763">News</option>
                <option value="10764">Reality</option>
                <option value="10765">Sci-Fi & Fantasy</option>
                <option value="10766">Soap</option>
                <option value="10767">Talk</option>
                <option value="10768">War & Politics</option>
                <option value="37">Western</option>
                <option value="16">Anime</option>
            </select>
            <select name="year" value={filters.year} onChange={handleChange}>
                <option value="">All Years</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <select name="language" value={filters.language} onChange={handleChange}>
                <option value="">All Languages</option>
                <option value="hi">Hindi</option>
                <option value="ur">Urdu</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
            </select>
            <select name="sort" value={filters.sort} onChange={handleChange}>
                <option value="">Sort By</option>
                <option value="popularity.desc">Most Popular</option>
                <option value="first_air_date.desc">Newest First</option>
                <option value="first_air_date.asc">Oldest First</option>
            </select>
            <button type="submit">Apply Filters</button>
        </form>
    );
};

const Anlatest = () => {
    const [movieList, setMovieList] = useState([]);
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        language: '',
        country: '',
        sort: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [genres, setGenres] = useState({});

    const getMovies = () => {
        const { genre, year, language, country, sort } = filters;
        const query = [
            genre && `with_genres=${genre}`,
            year && `first_air_date_year=${year}`,
            language && `with_original_language=${language}`,
            country && `region=${country}`,
            sort && `sort_by=${sort}`,
            `page=${page}`
        ].filter(Boolean).join('&');

        fetch(`https://api.themoviedb.org/3/discover/tv?api_key=0d0f1379d0c8b95596f350605ec7f984&${query}`)
            .then(res => res.json())
            .then(json => {
                setMovieList(json.results);
                setTotalPages(json.total_pages > 500 ? 500 : json.total_pages);
            });
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    useEffect(() => {
        getMovies();
    }, [filters, page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
        setPage(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        getMovies();
    };

    const fetchGenres = async () => {
        const responses = await Promise.all([
            fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=0d0f1379d0c8b95596f350605ec7f984').then(res => res.json()),
            fetch('https://api.themoviedb.org/3/genre/tv/list?api_key=0d0f1379d0c8b95596f350605ec7f984').then(res => res.json())
        ]);

        const allGenres = [...responses[0].genres, ...responses[1].genres];
        const genresMap = {};
        allGenres.forEach(genre => {
            genresMap[genre.id] = genre.name;
        });

        setGenres(genresMap);
    };

    const getGenreNames = (genreIds) => genreIds.map(id => genres[id]).join(', ');

    const renderPagination = () => {
        const pageButtons = [];
        const maxVisiblePages = 10;
        const startPage = Math.max(1, page - 4);
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (startPage > 1) {
            pageButtons.push(<button key={1} onClick={() => setPage(1)}>1</button>);
        }

        if (startPage > 2) {
            pageButtons.push(<span key="start-ellipsis">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={i === page ? 'active' : ''}
                >
                    {i}
                </button>
            );
        }

        if (endPage < totalPages - 1) {
            pageButtons.push(<span key="end-ellipsis">...</span>);
        }

        if (endPage < totalPages) {
            pageButtons.push(<button key={totalPages} onClick={() => setPage(totalPages)}>{totalPages}</button>);
        }

        return (
            <div className="pagination-controls">
                <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>
                    Previous
                </button>
                {pageButtons}
                <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        );
    };

    return (
        <div>
            <h1 className="title">Trending on TV</h1>
            <FilterBar filters={filters} handleChange={handleChange} handleSubmit={handleSubmit} />
            <div className="cards">
                {movieList.map((movie) => (
                    <Card key={movie.id} className="movie-card">
                        <Link to={`/tv/${movie.id}`}>
                            <Card.Img variant="top" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} />
                            <div className="hover-details">
                                <h5>{movie.title || movie.name}</h5>
                                <p>{getGenreNames(movie.genre_ids)}</p>
                                <p>{movie.release_date || movie.first_air_date}</p>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>
            {renderPagination()}
        </div>
    );
};

export default Anlatest;
