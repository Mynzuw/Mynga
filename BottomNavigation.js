import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BottomNavigation = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=83326&format=png&color=000000' }} style={styles.navIcon} />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Genre')}>
        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=GdXtjsKgQSjH&format=png&color=000000' }} style={styles.navIcon} />
        <Text style={styles.navText}>Genre</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Search')}>
        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=7695&format=png&color=000000' }} style={styles.navIcon} />
        <Text style={styles.navText}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Library')}>
        <Image source={{ uri: 'https://img.icons8.com/?size=100&id=KP6x5EOTVS1q&format=png&color=000000' }} style={styles.navIcon} />
        <Text style={styles.navText}>Library</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    width: 30,
    height: 30,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomNavigation;
