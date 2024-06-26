import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function MangaListScreen({ route }) {
  const { genre } = route.params;
  const [manga, setManga] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTagsAndManga = async () => {
      try {
        const baseUrl = 'https://api.mangadex.org';
        const excludedTagNames = ["Boys' Love", "Girls' Love"];
        
        // Fetch all tags
        const tagsResponse = await axios.get(`${baseUrl}/manga/tag`);
        const tags = tagsResponse.data.data;

        // Map genre names to their respective tag IDs
        const includedTagIDs = tags
          .filter(tag => tag.attributes.name.en === genre)
          .map(tag => tag.id);
        
        const excludedTagIDs = tags
          .filter(tag => excludedTagNames.includes(tag.attributes.name.en))
          .map(tag => tag.id);

        // Fetch manga based on included and excluded tags
        const mangaResponse = await axios.get(`${baseUrl}/manga`, {
          params: {
            includedTags: includedTagIDs,
            excludedTags: excludedTagIDs
          },
        });

        const mangaData = mangaResponse.data.data;

        const mangaWithThumbnails = await Promise.all(mangaData.map(async manga => {
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

        setManga(mangaWithThumbnails);
      } catch (error) {
        console.error('Failed to fetch manga', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTagsAndManga();
  }, [genre]);

  const renderItem = ({ item }) => {
    const imageUrl = item.thumbnail ? `https://uploads.mangadex.org/covers/${item.id}/${item.thumbnail}` : null;

    return (
      <TouchableOpacity onPress={() => navigation.navigate('Detail', { mangaId: item.id, mangaThumbnails: item.thumbnail })} style={styles.card}>
        {imageUrl && <Image source={{ uri: imageUrl }} style={styles.thumbnail} />}
        <View style={styles.content}>
          <Text style={styles.title}>{item.attributes.title.en}</Text>
          <Text style={styles.status}>Status: {item.attributes.status}</Text>
          <Text style={styles.genres}>Genres: {item.attributes.tags.map(tag => tag.attributes.name.en).join(', ')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={manga}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
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
