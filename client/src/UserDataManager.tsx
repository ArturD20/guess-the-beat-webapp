import axios from "axios";

interface User {
    display_name: string;
    id: string;
    score: number | null;
    image: string | null;
}

interface ScoreManager {
    fetchUserData: (accessToken: string | null) => Promise<User | null>;
    updateScoreOnServer: (userId: string, displayName: string, score: number | null) => Promise<void>;
}

const ScoreManager: ScoreManager = {
    fetchUserData: async (accessToken) => {
        if (!accessToken) {
            console.error("Access token is null or undefined");
            return null;
        }

        try {
            // Fetch user data from Spotify
            const spotifyUserResponse = await axios.get("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const user = spotifyUserResponse.data;

            // Fetch user score from your database server
            const databaseServerResponseScore = await axios.post("http://localhost:2115/get-user-data", {
                User_Id: user.id,
            });

            const score = databaseServerResponseScore.data.data.Score;

            // Extract user's profile image URL
            const image = user.images && user.images.length > 0 ? user.images[0].url : null;

            return {
                display_name: user.display_name,
                id: user.id,
                score,
                image, // Include the user's profile image URL
            };
        } catch (error) {
            console.error("Error fetching user data or score: ", error);
            return null;
        }
    },

    updateScoreOnServer: async (userId, displayName, score) => {
        if (!userId || score === null) {
            console.error("User ID or score is invalid");
            return;
        }

        try {
            // Update user score on your database server
            const databaseServerResponse = await axios.post("http://localhost:2115/store-user-data", {
                User_Id: userId,
                DisplayName: displayName,
                Score: score,
            });
            console.log("Score updated on server:", databaseServerResponse.data);
        } catch (error) {
            console.error("Error updating score on server: ", error);
        }
    }
};

export default ScoreManager;
