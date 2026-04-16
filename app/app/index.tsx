import Page from '@/components/templates/Page'
import { AuthContext } from '@/context/AuthContext'
import React, { useContext, useEffect } from 'react'
import {Image} from "react-native";
import { useRouter } from 'expo-router';





const Index = () => {
  const router = useRouter();
  const {handleInitialAuthentication} = useContext(AuthContext)
  
  const handleCheckAuthentication = async() => {
    // Try to authenticate if token exists, but don't block navigation
    await handleInitialAuthentication()
  }

  useEffect(()=>{
    // Check authentication in background, then navigate to tabs
    handleCheckAuthentication().then(() => {
      // Navigate to tabs regardless of authentication status
      router.replace('/(tabs)');
    });
  },[])


  return (
    <Page alignItems='center' justifyContent='center'>

        <Image
            source={require('@/assets/images/icon.png')}
            style={{
                width: 200,
                height: 200,
            }}
        />
    </Page>
  )
}



export default Index
