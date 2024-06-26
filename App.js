import React, { useRef, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './components/HomeScreen';
import SearchScreen from './components/SearchScreen';
import DetailScreen from './components/DetailScreen';
import ReadScreen from './components/ReadScreen';
import GenreScreen from './components/GenreScreen';
import MangaListScreen from './components/MangaListScreen';
import ReadingHistoryScreen from './components/ReadingHistoryScreen';
import BookmarksScreen from './components/BookmarksScreen';
import LibraryScreen from './components/LibraryScreen';
import BottomNavigation from './BottomNavigation';

const Stack = createStackNavigator();

const App = () => {
  const navigationRef = useRef(null); // Gunakan useRef untuk navigationRef
  const [routeName, setRouteName] = useState();

  useEffect(() => {
    const unsubscribe = navigationRef.current.addListener('state', () => {
      const currentRoute = navigationRef.current.getCurrentRoute(); // Gunakan navigationRef.current
      setRouteName(currentRoute?.name);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Read" component={ReadScreen} />
        <Stack.Screen name="Genre" component={GenreScreen} />
        <Stack.Screen name="MangaList" component={MangaListScreen} />
        <Stack.Screen name="History" component={ReadingHistoryScreen} />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
      </Stack.Navigator>
      {routeName !== 'Read' && <BottomNavigation />}
    </NavigationContainer>
  );
};

export default App;
