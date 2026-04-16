import * as AppleAuthentication from 'expo-apple-authentication';

export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    return credential;
  } catch (error) {
    //console.error('Apple login error', error);
    throw error;
  }
}
