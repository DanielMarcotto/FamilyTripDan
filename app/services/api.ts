
//import { registerForPushNotificationsAsync } from "@/app/_layout";

import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";



const API_URL = "https://family-trip-livid.vercel.app"
 // const API_URL = "http://localhost:4000"
 //const API_URL = "http://10.0.2.2:4000"

const TOKEN_KEY = "fmtrp_token";



//GLOBAL CALLS

export async function getToken() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);

    if (token) {
        return token
    } else {
        return false
    }
}
export async function setToken(token: string) {
    try {
        if (!token) return false
        await SecureStore.setItemAsync(TOKEN_KEY, token);

        return true
    } catch (error) {
        console.error("Error setting token:", error);
        return false;
    }
}
export async function removeToken() {
    //delete from secure store
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    //redirect to tabs (no longer forcing login)
    router.replace('/(tabs)')
}


/* AUTH CALLS */
export async function login(email: string, password: string) {

    const call = await fetch(`${API_URL}/oauth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })

    return await call.json()
}
export async function register(email: string, password: string, name: string, surname: string) {
    const call = await fetch(`${API_URL}/oauth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            name: name,
            surname: surname
        })
    })

    return await call.json()

}
export async function forgotPassword(email: string) {
    const call = await fetch(`${API_URL}/oauth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email
        })
    })

    return await call.json()
}
export async function authenticateOAuth() {

    const token = await getToken()

    if (token) {
        const call = await fetch(`${API_URL}/oauth/authenticate/sso`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        const response = await call.json()
        console.log(response)

        if (!response.success) {
            return { success: false }
        }

        if (Platform.OS === 'ios') {
            //const saveNotificationToken = registerForPushNotificationsAsync()
        }

        return {
            success: true,
            data: response.data,
            subscription: response.subscription
        }
    } else {
        return { success: false }
    }
}



/* NOTIFICATIONS  */


export async function saveNotificationToken(expoToken: string) {
    const token = await getToken()
    if (!token) return

    const response = await fetch(`${API_URL}/notifications/save-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`

        },
        body: JSON.stringify({
            token: expoToken
        })
    })


    return await response.json()
}



/* POI */

export async function getPOIs(page = 0) {
    const token = await getToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/navigation/poi?page=${page}`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

export async function getPOIById(id: string) {
    const token = await getToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/navigation/poi/${id}`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

/* Destinations */

export async function getDestinations(page = 0) {
    const token = await getToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/navigation/destinations?page=${page}`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

export async function getDestinationById(id: string) {
    const token = await getToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/navigation/destinations/${id}`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

/* Activities */

export async function getActivities(page = 0) {
    const token = await getToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/navigation/activities?page=${page}`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

export async function getActivityById(id: string) {
    const token = await getToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/navigation/activities/${id}`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

export async function getCategories() {
    const token = await getToken();
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/navigation/categories`, {
        method: "GET",
        headers,
    });

    console.log(`${API_URL}/navigation/categories`)
    return await response.json();
}

/* Favorites */

export async function getFavorites() {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/favorites`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

export async function addFavorite(poi_id: string) {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers,
        body: JSON.stringify({ poi_id }),
    });

    return await response.json();
}

export async function removeFavorite(poi_id: string) {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/favorites/${poi_id}`, {
        method: "DELETE",
        headers,
    });

    return await response.json();
}

export async function checkFavorite(poi_id: string) {
    const token = await getToken();
    
    if (!token) {
        return { success: false, isFavorite: false };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/favorites/check/${poi_id}`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

/* Family */
export async function getFamily() {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/family`, {
        method: "GET",
        headers,
    });

    return await response.json();
}

export async function addChild(name: string, age: number) {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/family`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name, age }),
    });

    return await response.json();
}

export async function updateChild(childId: string, name?: string, age?: number) {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const body: { name?: string; age?: number } = {};
    if (name !== undefined) body.name = name;
    if (age !== undefined) body.age = age;

    const response = await fetch(`${API_URL}/family/${childId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    });

    return await response.json();
}

export async function removeChild(childId: string) {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/family/${childId}`, {
        method: "DELETE",
        headers,
    });

    return await response.json();
}

/* Account Deletion */
export async function deleteAccount() {
    const token = await getToken();
    
    if (!token) {
        return { success: false, message: "Authentication required" };
    }
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/oauth/account`, {
        method: "DELETE",
        headers,
    });

    return await response.json();
}