import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Page from '@/components/templates/Page';
import Map from '@/components/templates/Map';
import { useNavigation } from '@/context/NavigationContext';
import { logScreenView } from '@/services/analytics';

const Index = React.memo(() => {
  const { setMapMode } = useNavigation();

  // Enable map mode when tab is focused, disable when unfocused
  useFocusEffect(
    React.useCallback(() => {
      // Enable map mode when entering the map tab
      setMapMode(true);
      logScreenView('Map');
      // Disable map mode when leaving the map tab (cleanup)
      return () => {
        setMapMode(false);
      };
    }, [setMapMode])
  );

  return (
      <Page noPaddingTop noBottomBar alignItems="center" justifyContent="space-between" page="home">
        <Map/>
      </Page>
  );
});

Index.displayName = 'MapTab';

export default Index;
