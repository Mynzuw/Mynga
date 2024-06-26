import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Platform, StatusBar } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const navigation = useNavigation();

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

  useEffect(() => {
    if (query.trim() !== '') {
      searchManga();
    } else {
      setResults([]);
    }
  }, [query]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Detail', { mangaId: item.id, mangaThumbnails: item.thumbnail })} style={styles.card}>
      {item.thumbnail && <Image source={{ uri: `https://uploads.mangadex.org/covers/${item.id}/${item.thumbnail}` }} style={styles.thumbnail} />}
      <View style={styles.content}>
        <Text style={styles.title}>{item.attributes.title.en}</Text>
        <Text style={styles.status}>Status: {item.attributes.status}</Text>
        <Text style={styles.genres}>Genres: {item.attributes.tags.map(tag => tag.attributes.name.en).join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight }]}>
      <Text style={styles.title}>Manga Search</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setQuery(text)}
        onSubmitEditing={searchManga}
        value={query}
        placeholder="Search manga..."
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
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
    marginTop: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8,
    padding: 12,
  },
  thumbnail: {
    width: 100,
    height: 150,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    marginBottom: 4,
  },
  genres: {
    fontSize: 14,
  },
});

export default SearchScreen;
