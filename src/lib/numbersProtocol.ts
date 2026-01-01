import { ProofSnapAsset } from "@/types";

const API_BASE_URL = "https://dia-backend.numbersprotocol.io/api/v3";

export async function fetchUserAssets(
  captureToken: string
): Promise<ProofSnapAsset[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/assets/`, {
      headers: {
        Authorization: `token ${captureToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch assets");
    }

    const data = await response.json();

    // The API returns results in a paginated format
    return data.results || [];
  } catch (error) {
    console.error("Error fetching ProofSnap assets:", error);
    throw error;
  }
}
