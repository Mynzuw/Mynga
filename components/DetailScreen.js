import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailScreen = ({ route }) => {

  const saveReadingHistory = async (mangaId, chapterId, chapterNumber) => {
    try {
      const history = await AsyncStorage.getItem('readingHistory') || '[]';
      const historyArray = JSON.parse(history);
      const newReading = { mangaId, chapterId, chapterNumber };
      const existingReading = historyArray.find(item => (
        item.mangaId === mangaId && item.chapterId === chapterId
      ));
      
      if (!existingReading) {
        historyArray.push(newReading);
        await AsyncStorage.setItem('readingHistory', JSON.stringify(historyArray));
      }
    } catch (error) {
      console.error('Error saving reading history:', error);
    }
  };

  const saveToBookmark = async (mangaId, mangaTitle, mangaThumbnails) => {
    try {
      const bookmarks = await AsyncStorage.getItem('bookmarks') || '[]';
      const bookmarksArray = JSON.parse(bookmarks);
      const existingBookmarkIndex = bookmarksArray.findIndex(item => item.mangaId === mangaId);
      
      if (existingBookmarkIndex === -1) {
        const newBookmark = { mangaId, mangaTitle, mangaThumbnails };
        bookmarksArray.push(newBookmark);
        await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarksArray));
        setIsBookmarked(true);
        Alert.alert('Success', `${mangaTitle} bookmarked!`);
      } else {
        bookmarksArray.splice(existingBookmarkIndex, 1);
        await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarksArray));
        setIsBookmarked(false);
        Alert.alert('Success', `${mangaTitle} removed from bookmarks.`);
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      Alert.alert('Error', 'Failed to save bookmark.');
    }
  };

  const { mangaId, mangaThumbnails } = route.params;
  const [mangaDetails, setMangaDetails] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false); // State untuk status bookmark
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMangaDetails = async () => {
      try {
        const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}`);
        setMangaDetails(response.data.data);
      } catch (error) {
        console.error('Error fetching manga details:', error);
      }
    };

    const fetchChapters = async () => {
      try {
        const response = await axios.get(`https://api.mangadex.org/manga/${mangaId}/feed`);
        setChapters(response.data.data); // Mengambil data dari response.data.data
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };

    const checkBookmarkStatus = async () => {
      try {
        const bookmarks = await AsyncStorage.getItem('bookmarks') || '[]';
        const bookmarksArray = JSON.parse(bookmarks);
        const existingBookmark = bookmarksArray.find(item => item.mangaId === mangaId);
        if (existingBookmark) {
          setIsBookmarked(true);
        } else {
          setIsBookmarked(false);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    fetchMangaDetails();
    fetchChapters();
    checkBookmarkStatus();
  }, [mangaId]);

  // Filter bab yang memiliki terjemahan dalam bahasa Inggris atau Indonesia
  const filteredChapters = chapters.filter(chapter => (
    chapter.attributes.translatedLanguage === 'en' || chapter.attributes.translatedLanguage === 'id'
  ));

  // Mengelompokkan bab berdasarkan volume
  const chaptersByVolume = filteredChapters.reduce((acc, chapter) => {
    const volume = chapter.attributes.volume || 'Unknown'; // Jika volume tidak tersedia, gunakan 'Unknown'
    if (!acc[volume]) {
      acc[volume] = [];
    }
    acc[volume].push(chapter);
    return acc;
  }, {});

  // Mendapatkan array volume yang diurutkan
  const sortedVolumes = Object.keys(chaptersByVolume).sort();

  // Sort chapters within each volume by chapter number in ascending order
  sortedVolumes.forEach(volume => {
    chaptersByVolume[volume].sort((a, b) => {
      const chapterA = parseFloat(a.attributes.chapter);
      const chapterB = parseFloat(b.attributes.chapter);
      return chapterA - chapterB;
    });
  });

  return (
    <ScrollView style={styles.container}>
      {mangaDetails && (
        <>
          <Text style={styles.title}>{mangaDetails.attributes.title.en}</Text>
          <Image source={{ uri: `https://uploads.mangadex.org/covers/${mangaId}/${mangaThumbnails}` }} style={styles.thumbnail} />
          <Text style={styles.description}>{mangaDetails.attributes.description.en}</Text>
          <TouchableOpacity
            style={[styles.bookmarkButton, { backgroundColor: isBookmarked ? '#ff6347' : '#f0f0f0' }]}
            onPress={() => saveToBookmark(mangaId, mangaDetails.attributes.title.en, mangaThumbnails)}
          >
            <Image source={require('../assets/bookmark.png')} style={styles.bookmarkIcon} />
          </TouchableOpacity>
        </>
      )}
      <Text style={styles.chapterTitle}>Chapter List</Text>
      
      {sortedVolumes.map(volume => (
        <View key={volume}>
          <Text style={styles.volumeTitle}>Volume {volume}</Text>
          {chaptersByVolume[volume].map(chapter => (
            <TouchableOpacity
              key={chapter.id}
              style={styles.chapterItem}
              onPress={() => {
                const chapterNumber = chapter.attributes.chapter;
                saveReadingHistory(mangaId, chapter.id, chapterNumber);
                navigation.navigate('Read', { chapterId: chapter.id, chapterNumber });
              }}
            >
              <Text>
                {chapter.attributes.translatedLanguage === 'en' && (
                  <Image source={require('../assets/uk-flag.png')} style={styles.flag} />
                )}
                {chapter.attributes.translatedLanguage === 'id' && (
                  <Image source={require('../assets/id-flag.png')} style={styles.flag} />
                )}
                Chapter {chapter.attributes.chapter}
              </Text>
              <Text>{chapter.attributes.title || 'No Title'}</Text>
              <Text>________________________________________________</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  thumbnail: { width: 200, height: 300 },
  description: { marginVertical: 10 },
  chapterTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  volumeTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  chapterItem: { marginVertical: 5 },
  flag: { width: 20, height: 20 },
  bookmarkButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 5,
  },
  bookmarkIcon: {
    width: 20,
    height: 20,
  },
});

export default DetailScreen;
