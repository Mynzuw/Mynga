import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, StyleSheet, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;
  const navigation = useNavigation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [latestManga, setLatestManga] = useState([]);

  // Function untuk melakukan pencarian manga berdasarkan query
  const searchManga = async () => {
    try {
      const response = await axios.get(`https://api.mangadex.org/manga?title=${query}`);
      const mangaData = response.data.data;
      const mangaWithThumbnails = await Promise.all(mangaData.map(async manga => {
        try {
          const tags = manga.attributes.tags.map(tag => tag.attributes.name.en.toLowerCase());
          if (tags.includes("nsfw") || tags.includes("hentai") || tags.includes("lgbt")) {
            return null;
          }
          const coverId = manga.relationships.find(rel => rel.type === 'cover_art').id;
          const coverResponse = await axios.get(`https://api.mangadex.org/cover/${coverId}`);
          const thumbnail = coverResponse.data.data.attributes.fileName;
          return { ...manga, thumbnail };
        } catch (error) {
          console.error('Error fetching thumbnail:', error);
          return manga;
        }
      }));

      const filteredManga = mangaWithThumbnails.filter(manga => manga !== null);
      setResults(filteredManga);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function untuk mengambil daftar manga terbaru
  const fetchLatestManga = async () => {
    try {
      const response = await axios.get('https://api.mangadex.org/manga', {
        params: {
          limit: 10, // Ambil 10 manga terbaru
          order: {
            updatedAt: 'desc' // Urutkan berdasarkan waktu pembaruan secara descending
          }
        }
      });

      const latestMangaData = response.data.data;
      const mangaWithThumbnails = await Promise.all(latestMangaData.map(async manga => {
        try {
          const coverId = manga.relationships.find(rel => rel.type === 'cover_art').id;
          const coverResponse = await axios.get(`https://api.mangadex.org/cover/${coverId}`);
          const thumbnail = coverResponse.data.data.attributes.fileName;
          return { ...manga, thumbnail };
        } catch (error) {
          console.error('Error fetching thumbnail:', error);
          return manga;
        }
      }));

      setLatestManga(mangaWithThumbnails);
    } catch (error) {
      console.error('Error fetching latest manga:', error);
    }
  };

  useEffect(() => {
    fetchLatestManga();
  }, []);

  // Render item untuk flatlist manga terbaru dan hasil pencarian
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Detail', { mangaId: item.id, mangaThumbnails: item.thumbnail })} style={styles.card}>
      <Image source={{ uri: `https://uploads.mangadex.org/covers/${item.id}/${item.thumbnail}` }} style={styles.thumbnail} />
      <Text style={styles.title} numberOfLines={2}>{item.attributes.title.en}</Text>
    </TouchableOpacity>
  );

  // Fungsi untuk navigasi ke halaman pencarian manga
  const goToSearchScreen = () => {
    navigation.navigate('Search');
  };

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      {/* Section untuk menampilkan manga terbaru */}
      <Text style={styles.sectionTitle}>Latest Manga</Text>
      <FlatList
        data={latestManga}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
      />

      {/* Section untuk mencari manga */}
      <Text style={styles.sectionTitle}>Search Manga</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setQuery(text)}
        onSubmitEditing={searchManga}
        value={query}
        placeholder="Search manga..."
        onPress={goToSearchScreen}
      />
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  list: {
    width: '100%',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
    padding: 12,
    marginRight: 12,
    width: 180,
  },
  thumbnail: {
    width: 180,
    height: 250,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    marginBottom: 4,
  },
  genres: {
    fontSize: 14,
  },
});

export default HomeScreen;
