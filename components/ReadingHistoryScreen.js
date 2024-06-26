import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ReadingHistoryScreen = () => {
  const [history, setHistory] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReadingHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('readingHistory');
        const historyArray = storedHistory ? JSON.parse(storedHistory) : [];

        // Fetch manga titles for each mangaId in history
        const updatedHistory = await Promise.all(historyArray.map(async item => {
          if (!item.mangaTitle) {
            try {
              const response = await axios.get(`https://api.mangadex.org/manga/${item.mangaId}`);
              const mangaTitle = response.data.data.attributes.title.en || 'No Title';
              return { ...item, mangaTitle };
            } catch (error) {
              console.error(`Error fetching title for mangaId ${item.mangaId}:`, error);
              return { ...item, mangaTitle: 'Unknown Title' };
            }
          }
          return item;
        }));

        // Save the updated history with manga titles back to AsyncStorage
        await AsyncStorage.setItem('readingHistory', JSON.stringify(updatedHistory));
        
        // Set history state with reversed order (from newest to oldest)
        setHistory(updatedHistory.reverse());
      } catch (error) {
        console.error('Error loading reading history:', error);
      }
    };

    fetchReadingHistory();
  }, []);

  const handlePress = (item) => {
    console.log('Item pressed:', item); // Debug log
    navigation.navigate('Read', { chapterId: item.chapterId, mangaId: item.mangaId, mangaTitle: item.mangaTitle });
  };

  const handleDelete = async (mangaId, chapterId) => {
    try {
      // Filter out the item to be deleted
      const updatedHistory = history.filter(item => !(item.mangaId === mangaId && item.chapterId === chapterId));
      await AsyncStorage.setItem('readingHistory', JSON.stringify(updatedHistory));
      setHistory(updatedHistory); // Update history state without reversing
      Alert.alert('Success', 'Item deleted from reading history.');
    } catch (error) {
      console.error('Error deleting item from reading history:', error);
      Alert.alert('Error', 'Failed to delete item from reading history.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => handlePress(item)}
      >
        <Text style={styles.chapterTitle}>
          {item.mangaTitle} - Chapter {item.chapterNumber}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.mangaId, item.chapterId)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reading History</Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 15,
  },
  item: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ReadingHistoryScreen;
