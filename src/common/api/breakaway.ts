import axios, { AxiosResponse } from "axios"
import * as ls from "../util/local-storage";

// const baUrl = "http://localhost:4000"
const baUrl = "https://breakaway-points-system-api.onrender.com"

interface BaUserPointsResponse {
  points: number;
}

const apiClient = axios.create({
  baseURL: baUrl,
  headers: {
    Authorization: `Bearer ${ls.get("ba_access_token")}`, // Token actualizado dinámicamente
  },
});

export const createBreakawayUser = async (username: string, community: string, referral: string, email: string) => {
  // Aquí debería haber una validación de los parámetros de entrada.
  try {
      const data = {
          username,
          community,
          referral,
          email
      };
      const response = await apiClient.post("/signup-keychain", data);
      return response;
  } catch (error) {
      throw error;
  }
};


export const createSolanaUser = async (email: string, password: string, solanaWalletAddress: string) => {
  // Valida los parámetros de entrada aquí.
  try {
    const data = {
      email,
      password,
      solanaWalletAddress,
    };
    const response = await apiClient.post("/offchain-users/register", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const processLogin = async (username: string, ts: string, sig: string, community: string) => {
  // Valida los parámetros de entrada aquí.
  try {
    const response = await apiClient.get("/auth/login", {
      params: { username, ts, sig, community },
    });
    const { token, ...user } = response.data.response;
    return response;
  } catch (error) { 
    throw error;
  }
};

export const claimBaPoints = async (username: string, community: string) => {
  // Valida los parámetros de entrada aquí.
  try {
    const response = await apiClient.post("/points/claim", { username, community });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getBaUserPoints = async (username: string, community: string): Promise<BaUserPointsResponse | undefined> => {
  // Valida los parámetros de entrada aquí.
  try {
    const response = await apiClient.get(`/points?username=${username}&community=${community}`);
    return response.data as BaUserPointsResponse;
  } catch (error) {
    throw error;
  } 
};

export const updateUserPoints = async (username: string, community: string, pointType: string) => {
  // Valida los parámetros de entrada aquí.
  try {
    const requestData = {
      username,
      community,
      pointType,
    };
    const response = await apiClient.post("/points", requestData);
    return response;
  } catch (error) {
    throw error;
  }
};