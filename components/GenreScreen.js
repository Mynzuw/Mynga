import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const genres = [
  'Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Historical', 'Horror', 'Isekai', 'Magical Girls', 'Mecha', 
  'Medical', 'Mystery', 'Philosophical', 'Psychological', 'Romance', 'Sci-Fi', 
  'Slice of Life', 'Sports', 'Superhero', 'Thriller', 'Tragedy', 'Wuxia'
];

export default function GenreScreen() {
  const navigation = useNavigation();
  const [selectedGenre, setSelectedGenre] = useState(null);

  const handlePress = (genre) => {
    setSelectedGenre(genre);
    navigation.navigate('MangaList', { genre });
  };

  return (
    <ScrollView style={styles.container}>
      {genres.map((genre) => (
        <TouchableOpacity
          key={genre}
          style={[styles.tab, selectedGenre === genre && styles.selectedTab]}
          onPress={() => handlePress(genre)}
        >
          <Text style={[styles.tabText, selectedGenre === genre && styles.selectedTabText]}>{genre}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, backgroundColor: '#fff' },
  tab: { paddingVertical: 10, paddingHorizontal: 20 },
  selectedTab: { borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { fontSize: 16, color: '#000' },
  selectedTabText: { color: '#2196F3' },
});
