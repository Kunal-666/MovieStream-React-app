import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import { gql, request } from 'graphql-request';

const FilterBar = ({ filters, handleChange, handleGenreChange, handleSubmit }) => {
    const animeGenres = [
        { value: "Action", label: "Action" },
        { value: "Adventure", label: "Adventure" },
        { value: "Comedy", label: "Comedy" },
        { value: "Drama", label: "Drama" },
        { value: "Fantasy", label: "Fantasy" },
        { value: "Horror", label: "Horror" },
        { value: "Mystery", label: "Mystery" },
        { value: "Romance", label: "Romance" },
        { value: "Sci-Fi", label: "Science Fiction" },
        { value: "Slice of Life", label: "Slice of Life" },
        { value: "Sports", label: "Sports" },
        { value: "Supernatural", label: "Supernatural" },
        { value: "Thriller", label: "Thriller" },
    ];

    const animeSortOptions = [
        { value: "POPULARITY_DESC", label: "Most Popular" },
        { value: "TRENDING_DESC", label: "Trending" },
        { value: "SCORE_DESC", label: "Top Rated" },
        { value: "SEASON_YEAR_DESC", label: "Newest First" },
        { value: "SEASON_YEAR_ASC", label: "Oldest First" }
    ];

    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);

    const toggleGenreDropdown = () => {
        setIsGenreDropdownOpen(!isGenreDropdownOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown')) {
                setIsGenreDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div>
            <form className="filter-bar" onSubmit={handleSubmit}>
                {/* Search bar */}
                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    placeholder="Search by title..."
                    onChange={handleChange}
                />

                {/* Genre dropdown */}
                <div className="dropdown">
                    <button type="button" onClick={toggleGenreDropdown}>
                        Select Genres
                    </button>
                    {isGenreDropdownOpen && (
                        <div className="dropdown-content">
                            {animeGenres.map((genre) => (
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

                {/* Year filter */}
                <select name="year" value={filters.year} onChange={handleChange}>
                    <option value="">All Years</option>
                    {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>

                {/* Sort by filter */}
                <select name="sort" value={filters.sort} onChange={handleChange}>
                    <option value="">Sort By</option>
                    {animeSortOptions.map((sort) => (
                        <option key={sort.value} value={sort.value}>{sort.label}</option>
                    ))}
                </select>

                <button type="submit">Apply Filters</button>
            </form>
        </div>
    );
};

const Animes = () => {
    const [list, setList] = useState([]);
    const [filters, setFilters] = useState({
        genre: [],
        year: '',
        sort: 'TRENDING_DESC',
        search: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const anilistEndpoint = 'https://graphql.anilist.co';

    const getItems = async () => {
        const { genre, year, sort, search } = filters;

        // AniList GraphQL query with pagination
        const query = gql`
            query ($page: Int, $genres: [String], $year: Int, $sort: [MediaSort], $search: String) {
                Page(page: $page, perPage: 20) {
                    media(type: ANIME, genre_in: $genres, seasonYear: $year, sort: $sort, search: $search) {
                        id
                        title {
                            english
                        }
                        coverImage {
                            large
                        }
                        genres
                        seasonYear
                    }
                }
            }
        `;

        const variables = {
            page: currentPage,
            genres: genre.length > 0 ? genre : null,
            year: year ? parseInt(year) : null,
            sort: sort || 'POPULARITY_DESC',
            search: search || null,
        };

        try {
            setLoading(true);
            const data = await request(anilistEndpoint, query, variables);
            setList(data.Page.media);
            setError(null);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch anime data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getItems();
    }, [filters, currentPage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
    };

    const handleGenreChange = (e) => {
        const { value, checked } = e.target;
        setFilters((prevState) => {
            const newGenres = checked
                ? [...prevState.genre, value]
                : prevState.genre.filter((genre) => genre !== value);
            return {
                ...prevState,
                genre: newGenres,
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to page 1 on new filter submission
        getItems();
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
    };

    return (
        <div>
            {/* <h1 className="title">Anime</h1> */}
            <FilterBar
                filters={filters}
                handleChange={handleChange}
                handleGenreChange={handleGenreChange}
                handleSubmit={handleSubmit}
            />
            {error && <div className="error-message">{error}</div>}
            {loading ? (
                <div className="spinner">Loading...</div>
            ) : (
                <><Container>

                </Container><h3 style={{ textTransform: 'uppercase', textAlign: 'center' }}>Anime List</h3><div className="cards">
                        {list.map((item) => (
                            <Card key={item.id} className="movie-card">
                                <Link to={`/anime/${item.id}`}>
                                    <Card.Img variant="top" src={item.coverImage.large} />
                                    <div className="hover-details">
                                        <h5>{item.title.english}</h5>
                                        <p>{item.genres.join(', ')}</p>
                                        <p>{item.seasonYear}</p>
                                    </div>
                                </Link>
                            </Card>
                        ))}
                    </div>
                        //    {/* Pagination Controls */}
                    <div className="pagination">
                        <button
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button onClick={handleNextPage}>Next</button>
                    </div></>
            )}
        </div>
    );
};

export default Animes;
