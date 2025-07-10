import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import './tv.css';
import { useAuth } from '../context/AuthContext';
import { gql, request } from 'graphql-request';
import { Link } from 'react-router-dom';

const Awatch = () => {
    const { currentUser, addToWatchList } = useAuth();
    const [watchList, setWatchList] = useState([]);
    const [relatedAnime, setRelatedAnime] = useState([]);
    const [animeDetails, setAnimeDetails] = useState(null);
    const [season, setSeason] = useState(localStorage.getItem('seas') || '1');
    const [episode, setEpisode] = useState(localStorage.getItem('epis') || '1');
    const [seasonList, setSeasonList] = useState([]);
    const [dub, setDub] = useState('1'); // New state for dub/sub selection
    const { id } = useParams();
    const anilistEndpoint = 'https://graphql.anilist.co';

    const fetchAnimeDetails = async () => {
        const query = gql`
            query ($id: Int) {
                Media(id: $id, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                    }
                    coverImage {
                        large
                    }
                    description
                    genres
                    episodes
                    season
                    seasonYear
                    recommendations {
                        edges {
                            node {
                                mediaRecommendation {
                                    id
                                    title {
                                        romaji
                                    }
                                    coverImage {
                                        large
                                    }
                                }
                            }
                        }
                    }
                    relations {
                        edges {
                            node {
                                id
                                title {
                                    romaji
                                }
                                type
                                episodes
                                season
                                seasonYear
                            }
                        }
                    }
                }
            }
        `;

        const variables = { id: parseInt(id) };

        try {
            const data = await request(anilistEndpoint, query, variables);
            const anime = data.Media;
            setAnimeDetails(anime);
            const relatedSeasons = anime.relations.edges.filter(edge => edge.node.type === "ANIME");
            setSeasonList(relatedSeasons);
            const related = anime.recommendations.edges.map(edge => edge.node.mediaRecommendation);
            setRelatedAnime(related);
            if (currentUser) {
                handleAddToWatchList(anime);
            }
        } catch (error) {
            console.error('Error fetching anime details:', error);
        }
    };

    const handleAddToWatchList = async (anime) => {
        await addToWatchList(currentUser.uid, {
            id: anime.id,
            type: 'anime',
            genres: anime.genres,
            title: anime.title.romaji,
        });
        setWatchList([...watchList, anime]);
    };

    useEffect(() => {
        fetchAnimeDetails();
    }, [id]);

    const handleSeasonChange = (event) => {
        const selectedSeason = event.target.value;
        setSeason(selectedSeason);
        localStorage.setItem('seas', selectedSeason);
        setEpisode('1');
    };

    const handleEpisodeChange = (event) => {
        const selectedEpisode = event.target.value;
        setEpisode(selectedEpisode);
        localStorage.setItem('epis', selectedEpisode);
    };

    const handleDubChange = (event) => {
        const selectedDub = event.target.value;
        setDub(selectedDub); // Update dub/sub state
    };

    const currentSeason = seasonList.find(s => s.node.id.toString() === season);
    const totalEpisodes = currentSeason?.node.episodes || animeDetails?.episodes || 1;

    const episodeOptions = [];
    for (let i = 1; i <= totalEpisodes; i++) {
        episodeOptions.push(<option key={i} value={i}>{i}</option>);
    }

    const seasonOptions = seasonList.map(seasonData => (
        <option key={seasonData.node.id} value={seasonData.node.id}>
            {`${seasonData.node.title.romaji} (${seasonData.node.season} ${seasonData.node.seasonYear})`}
        </option>
    ));


    return (
        <Container className="mt-4">
            {animeDetails ? (
                <>
                    <Row className="mb-4">
                        <Col>
                            <h3 className="text-center text-primary">{animeDetails.title.romaji}</h3>
                            <div className="video-wrapper mb-4">
                                <iframe
                                    src={`https://vidsrc.icu/embed/anime/${id}/${episode}?dub=${dub}`}
                                    width="100%"
                                    height="400px"
                                    title="Anime Video"
                                    allowFullScreen
                                />
                            </div>

                        </Col>
                    </Row>
                    <Row className="mb-4 align-items-end">
                        <Col md={5}>
                            <Form.Group controlId="seasonSelect">
                                <Form.Label className="font-weight-bold">Choose a Season:</Form.Label>
                                <Form.Control as="select" value={season} onChange={handleSeasonChange}>
                                    {seasonOptions}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group controlId="episodeSelect">
                                <Form.Label className="font-weight-bold">Choose an Episode:</Form.Label>
                                <Form.Control as="select" value={episode} onChange={handleEpisodeChange}>
                                    {episodeOptions}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={5}>
                            <Form.Group controlId="dubSelect">
                                <Form.Label className="font-weight-bold">Sub or Dub:</Form.Label>
                                <Form.Control as="select" value={dub} onChange={handleDubChange}>
                                    <option value="0">Subbed</option>
                                    <option value="1">Dubbed</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Related Anime and Other UI */}
                    <Row>
                        <Col md={4}>
                            <Card className="shadow-sm mb-4">
                                <Card.Img variant="top" src={animeDetails.coverImage.large} alt="poster" />
                                <Card.Body>
                                    <Card.Title>Genres</Card.Title>
                                    <Card.Text>{animeDetails.genres.join(', ')}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={8}>
                            <Card className="shadow-sm mb-4">
                                <Card.Body>
                                    <Card.Title>Overview</Card.Title>
                                    <Card.Text dangerouslySetInnerHTML={{ __html: animeDetails.description }} />
                                    <Card.Title>Total Episodes</Card.Title>
                                    <Card.Text>{totalEpisodes}</Card.Text>
                                    <Card.Title>Season</Card.Title>
                                    <Card.Text>{animeDetails.season} {animeDetails.seasonYear}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row className="mt-4">
                        <Col>
                            <h5 className="text-primary mb-3">Related Anime</h5>
                            <Row xs={2} md={3} lg={4} className="g-4">
                                {relatedAnime.map(show => (
                                    <Col key={show.id}>
                                        <Card className="shadow-sm h-100">
                                            <Card.Img variant="top" src={show.coverImage.large} alt={show.title.romaji} />
                                            <Card.Body>
                                                <Card.Title>{show.title.romaji}</Card.Title>
                                            </Card.Body>
                                            <Link to={`/anime/${show.id}`} className="watch-link">Watch</Link>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </Row>
                </>
            ) : (
                <Row className="justify-content-center">
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </Row>
            )}
        </Container >
    );
};

export default Awatch;
