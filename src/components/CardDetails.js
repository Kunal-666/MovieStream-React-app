import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import './tv.css';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const CardDetails = () => {
    const { currentUser, addToWatchList } = useAuth();
    const [watchList, setWatchList] = useState([]);
    const [relatedMovies, setRelatedMovies] = useState([]);
    const [movieDetails, setMovieDetails] = useState(null);
    const { id } = useParams();

    const handleAdd = async (item) => {
        await addToWatchList(currentUser.uid, item);
        setWatchList([...watchList, item]);
    };

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=0d0f1379d0c8b95596f350605ec7f984`);
                if (response.ok) {
                    const data = await response.json();
                    setMovieDetails(data);

                    const genres = data.genres ? data.genres.map(genre => genre.name) : [];
                    if (currentUser) {
                        handleAdd({ id: `${id}`, type: 'movie', genres: genres });
                    }

                } else {
                    throw new Error('Failed to fetch movie details');
                }
            } catch (error) {
                console.error('Error fetching movie details:', error);
            }
        };

        fetchMovieDetails();
    }, [id]);

    useEffect(() => {
        const fetchWatchList = async () => {
            if (currentUser) {
                try {
                    const userDocRef = doc(firestore, 'users', currentUser.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setWatchList(userDocSnap.data().watchList || []);
                    } else {
                        console.log('No such document!');
                    }
                } catch (error) {
                    console.error('Firestore Error:', error);
                }
            }
        };

        fetchWatchList();
    }, [currentUser]);

    useEffect(() => {
        const fetchRelatedMovies = async () => {
            try {
                const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?api_key=0d0f1379d0c8b95596f350605ec7f984`);
                if (response.ok) {
                    const data = await response.json();
                    setRelatedMovies(data.results);
                } else {
                    throw new Error('Failed to fetch related movies');
                }
            } catch (error) {
                console.error('Error fetching related movies:', error);
            }
        };

        fetchRelatedMovies();
    }, [id]);

    if (!movieDetails) {
        return (
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </Row>
            </Container>
        );
    }

    const { title, poster_path, genres, tagline, release_date, runtime, budget, revenue, overview } = movieDetails;

    return (
        <div>
            <Container className="mt-4">
                <Row className="mb-4">
                    <Col>
                        <h3 className="text-center text-primary">{title}</h3>
                        <div className="video-wrapper mb-4">
                            <iframe
                                src={`https://vidsrc.site/embed/movie?tmdb=${id}`}
                                width="100%"
                                height="360"
                                title="Video"
                                allowFullScreen
                            />
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col md={4}>
                        <Card className="shadow-sm mb-4">
                            <Card.Img variant="top" src={`https://image.tmdb.org/t/p/w500${poster_path}`} alt="poster" />
                            <Card.Body>
                                <Card.Title>Genres</Card.Title>
                                <Card.Text>{genres && genres.map(genre => genre.name).join(', ')}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={8}>
                        <Card className="shadow-sm mb-4">
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Card.Title>Tagline</Card.Title>
                                        <Card.Text>{tagline}</Card.Text>
                                        <Card.Title>Released Date</Card.Title>
                                        <Card.Text>{release_date}</Card.Text>
                                        <Card.Title>Length</Card.Title>
                                        <Card.Text>{`${runtime} min`}</Card.Text>
                                    </Col>
                                    <Col md={6}>
                                        <Card.Title>Budget</Card.Title>
                                        <Card.Text>{`${budget}$`}</Card.Text>
                                        <Card.Title>Revenue</Card.Title>
                                        <Card.Text>{`${revenue}$`}</Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title>Overview</Card.Title>
                                <Card.Text>{overview}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col>
                        <h5 className="text-primary mb-3">Related Movies</h5>
                        <Row xs={2} md={3} lg={4} className="g-4">
                            {relatedMovies.map(movie => (
                                <Col key={movie.id}>
                                    <Card className="shadow-sm h-100">
                                        <Card.Img variant="top" src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                                        <Card.Body>
                                            <Card.Title>{movie.title}</Card.Title>
                                            <Card.Text>{movie.release_date}</Card.Text>
                                        </Card.Body>
                                        <Link to={`/movie/${movie.id}`} className="watch-link">Watch</Link>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default CardDetails;
