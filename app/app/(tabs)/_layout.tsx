import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import {useNavigation} from "@/context/NavigationContext";
import { useMemo } from 'react';

export default function TabsLayout() {
    const { paginatedPOI } = useNavigation();
    
    // Memoize badge count to avoid expensive filter on every render
    const nearbyCount = useMemo(() => {
        if (!paginatedPOI || paginatedPOI.length === 0) return 0;
        const count = paginatedPOI.filter((poi: any) => isFinite(poi.distance) && poi.distance <= 10000).length;
        return count > 9 ? '9+' : count.toString();
    }, [paginatedPOI]);
    
  return (
    <NativeTabs>
      
        {/* HOME */}
        <NativeTabs.Trigger name="index">
          <Label>Home</Label>
          <Icon sf="house.fill" drawable="ic_menu_home" />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="destinations">
            <Label>Destinazioni</Label>
            <Icon sf="mappin" drawable="ic_menu_directions" />
        </NativeTabs.Trigger>

        {/* VICINANZE */}
        <NativeTabs.Trigger name="nearby">
            <Label>Vicinanze</Label>
            <Icon sf="location" drawable="ic_menu_mylocation" />
            {nearbyCount !== '0' && <Badge>{nearbyCount}</Badge>}
        </NativeTabs.Trigger>

        {/* MAPPA */}
        <NativeTabs.Trigger name="map">
          <Label>Mappa</Label>
          <Icon sf="map" drawable="ic_menu_mapmode" />
        </NativeTabs.Trigger>

        {/* ALTRO */}
        <NativeTabs.Trigger name="more">
          <Label>Altro</Label>
          <Icon sf="square.grid.2x2" drawable="ic_menu_more" />
        </NativeTabs.Trigger>
      
    </NativeTabs>
  );
}
