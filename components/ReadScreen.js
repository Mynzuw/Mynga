import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const ReadScreen = ({ route, navigation }) => {
  const { chapterId, mangaId, mangaTitle } = route.params;
  const [pages, setPages] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchChapterPages = async () => {
      try {
        const response = await axios.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
        const baseUrl = response.data.baseUrl;
        const hash = response.data.chapter.hash;
        const pageArray = response.data.chapter.data.map(page => `${baseUrl}/data/${hash}/${page}`);
        
        setPages(pageArray);

      } catch (error) {
        console.error('Error fetching chapter pages:', error);
      }
    };

    fetchChapterPages();

    navigation.setOptions({
      tabBarVisible: false,
    });

    return () => {
      navigation.setOptions({
        tabBarVisible: true,
      });
    };
  }, [chapterId, navigation]);


  return (
    <ScrollView style={styles.container}>
      {pages.map((page, index) => (
        <Image key={index} source={{ uri: page }} style={[styles.pageImage, { width: screenWidth }]} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
  },
});

export default ReadScreen;
