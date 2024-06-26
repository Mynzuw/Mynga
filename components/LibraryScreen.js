import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const LibraryScreen = ({ navigation }) => {

  const navigateToHistory = () => {
    navigation.navigate('History');
  };

  const navigateToBookmarks = () => {
    navigation.navigate('Bookmarks');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.optionButton} onPress={navigateToHistory}>
        <Text style={styles.optionText}>View History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={navigateToBookmarks}>
        <Text style={styles.optionText}>View Bookmarks</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default LibraryScreen;
