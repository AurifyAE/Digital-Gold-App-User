import axiosInstance from "../axios/axios";

export const loginUser = (data) => {
    return axiosInstance.post("/auth/login", data);
};

export const logoutUser = (id) => {
    return axiosInstance.post(`/auth/logout/${id}`);
};

export const registerUser = (data) => {
    return axiosInstance.post("/auth/register", data);
};

export const getSchemes = () => {
    return axiosInstance.get("/scheme");
};

export const selectScheme = (data) => {
    return axiosInstance.post("/scheme", data);
};

export const depositToWallet = (data) => {
    return axiosInstance.post("/wallet/payment", data);
};

export const getProfile = () => {
    return axiosInstance.get("/profile");
};

export const getSelectedSchemes = () => {
    return axiosInstance.get("/scheme-selected");
};

export const getAims = () => {
    return axiosInstance.get("/aim");
};

export const addAim = (data) => {
    return axiosInstance.post("/aim", data);
};

export const calculateAim = (data) => {
    return axiosInstance.post("/aim-calculation", data);
};

export const aimPayment = (data) => {
    return axiosInstance.get("/aim/payment", data);
};

export const addAddress = (data) => {
    return axiosInstance.post("/address", data);
};

export const updateAddress = (data) => {
    return axiosInstance.patch("/address", data);
};

export const updateProfile = (data) => {
    return axiosInstance.patch("/profile", data);
};

export const transactionHistory = () => {
    return axiosInstance.get("/transaction");
};