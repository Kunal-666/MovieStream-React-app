import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

const FilterBar = ({ filters, handleChange, handleGenreChange, handleSubmit }) => {
    const movieGenres = [
        { value: "28", label: "Action" },
        { value: "12", label: "Adventure" },
        { value: "35", label: "Comedy" },
        { value: "80", label: "Crime" },
        { value: "18", label: "Drama" },
        { value: "10751", label: "Family" },
        { value: "14", label: "Fantasy" },
        { value: "36", label: "History" },
        { value: "27", label: "Horror" },
        { value: "10402", label: "Music" },
        { value: "9648", label: "Mystery" },
        { value: "10749", label: "Romance" },
        { value: "878", label: "Science Fiction" },
        { value: "10770", label: "TV Movie" },
        { value: "53", label: "Thriller" },
        { value: "10752", label: "War" },
        { value: "37", label: "Western" },
    ];

    const tvGenres = [
        { value: "10759", label: "Action" },
        { value: "35", label: "Comedy" },
        { value: "80", label: "Crime" },
        { value: "18", label: "Drama" },
        { value: "10751", label: "Family" },
        { value: "10762", label: "Kids" },
        { value: "9648", label: "Mystery" },
        { value: "10765", label: "Fantasy" },
        { value: "10768", label: "War & Politics" },
        { value: "37", label: "Western" },
    ];
    const tvsort = [
        { value: "popularity.desc", label: "Most Popular" },
        { value: "first_air_date.desc", label: "Newest First" },
        { value: "first_air_date.asc", label: "Oldest First" }
    ];
    const moviesort = [
        { value: "popularity.desc", label: "Most Popular" },
        { value: "release_date.desc", label: "Newest First" },
        { value: "release_date.asc", label: "Oldest First" }
    ];

    const sort = filters.type === 'movie' ? moviesort : tvsort;
    const genres = filters.type === 'movie' ? movieGenres : tvGenres;

    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);

    const toggleGenreDropdown = () => {
        setIsGenreDropdownOpen(!isGenreDropdownOpen);
    };

    return (
        <form className="filter-bar" onSubmit={handleSubmit}>
            <select name="type" value={filters.type} onChange={handleChange}>
                <option value="movie">Movie</option>
                <option value="tv">TV Show</option>
            </select>
            <div className="dropdown">
                <button type="button" onClick={toggleGenreDropdown}>Select Genres</button>
                {isGenreDropdownOpen && (
                    <div className="dropdown-content">
                        {genres.map((genre) => (
                            <div key={genre.value}>
                                <input
                                    type="checkbox"
                                    id={genre.value}
                                    name="genre"
                                    value={genre.value}
                                    checked={filters.genre.includes(genre.value)}
                                    onChange={handleGenreChange}
                                />
                                <label htmlFor={genre.value}>{genre.label}</label>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <select name="year" value={filters.year} onChange={handleChange}>
                <option value="">All Years</option>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <select name="language" value={filters.language} onChange={handleChange}>
                <option value="">All Languages</option>
                <option value="ja">Japanese</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
            </select>
            <select name="sort" value={filters.sort} onChange={handleChange}>
                <option value="">Sort By</option>
                {sort.map((sort) => (
                    <option key={sort.value} value={sort.value}>{sort.label}</option>
                ))}
            </select>
            <button type="submit">Apply Filters</button>
        </form>
    );
};

function Home1() {
    const [list, setList] = useState([]);
    const [filters, setFilters] = useState({
        type: 'tv',
        genre: ['16'],
        year: '',
        language: 'ja',
        sort: '',
    });
    const [genres, setGenres] = useState({});
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const getItems = () => {
        const { type, genre, year, language, sort } = filters;
        const query = [
            genre.length > 0 && `with_genres=${genre.join(',')}`,
            year && `first_air_date_year=${year}`,
            language && `with_original_language=${language}`,
            sort && `sort_by=${sort}`,
            `page=${page}`
        ].filter(Boolean).join('&');

        fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=0d0f1379d0c8b95596f350605ec7f984&${query}`)
            .then(res => res.json())
            .then(json => {
                setList(json.results);
                setTotalPages(json.total_pages);
            });
    };

    useEffect(() => {
        fetchGenres();
        getItems();
    }, [filters, page]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleGenreChange = (e) => {
        const { value, checked } = e.target;
        setFilters((prevState) => {
            const newGenres = checked
                ? [...prevState.genre, value]
                : prevState.genre.filter((genre) => genre !== value);
            return { ...prevState, genre: newGenres };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        getItems();
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

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

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
            <h1 className="title">Anime</h1>
            <FilterBar filters={filters} handleChange={handleChange} handleGenreChange={handleGenreChange} handleSubmit={handleSubmit} />
            <Container>
                <h3 style={{ textTransform: 'uppercase', textAlign: 'center' }}>{filters.type}</h3>
            </Container>
            <div className="cards">
                {list.map((item) => (
                    <Card key={item.id} className="movie-card">
                        <Link to={`/${filters.type}/${item.id}`}>
                            <Card.Img variant="top" src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} />
                            <div className="hover-details">
                                <h5>{item.title || item.name}</h5>
                                <p>{getGenreNames(item.genre_ids)}</p>
                                <p>{item.release_date || item.first_air_date}</p>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>
            {renderPagination()}
        </div>
    );
}

export default Home1;
