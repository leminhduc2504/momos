import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardMedia,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function MainPage() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login'); 
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken'); 

      const response = await axios.get(`${API_BASE_URL}/scraper/media`, {
        params: { page, limit: 12, type: mediaType, search: searchText },
        headers: { Authorization: `Bearer ${token}` },
      });

      setMediaItems(response.data.data);
      setTotalPages(Math.ceil(response.data.pagination.total / 12));
    } catch (error) {
      setError('Failed to fetch media items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [page, mediaType, searchText]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken'); 
      const urlList = urls.split('\n').map(url => url.trim()).filter(url => url);
      if (urlList.length === 0) {
        setError('Please enter at least one valid URL.');
        setLoading(false);
        return;
      }

      await axios.post(
        `${API_BASE_URL}/scraper/scrape`,
        { urls: urlList },
        { headers: { Authorization: `Bearer ${token}` } } 
      );

      setUrls(''); 
      fetchMedia(); 
    } catch (error) {
      setError('Failed to scrape URLs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Media Scraper
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ my: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="Enter URLs (one per line)"
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mb: 4 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Scrape URLs'}
          </Button>
        </form>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Media Type</InputLabel>
                <Select
                  value={mediaType}
                  label="Media Type"
                  onChange={(e) => setMediaType(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="image">Images</MenuItem>
                  <MenuItem value="video">Videos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search by media url"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        <Button
          variant="outlined"
          onClick={fetchMedia}
          disabled={loading}
          sx={{ mb: 4 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Reload Media'}
        </Button>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          {mediaItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                {item.media_type === 'image' ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.media_url}
                    alt="Scraped media"
                  />
                ) : (
                  <CardMedia
                    component="video"
                    height="200"
                    src={item.media_url}
                    controls
                  />
                )}
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Box>
    </Container>
  );
}

export default MainPage;
