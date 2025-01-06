import axios from "axios";
import { API, domain } from "@/API/";

export const userInternal_Login = async (data) => {
  const response = await axios.post(API+'/api/userInternal/login', data)
  var suppData = response.data;
  return suppData
}

// Bon & Material
export const BonMaterial_GetPrefixByTypeAndDate = async (type, date) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getBonPrefix/'+ type + '/' +date)
  var suppData = response.data;
  return suppData
}

// Admin Teknisi
export const adminTeknis_GetDataByDomainAndDeleted = async (deleted) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdata/'+ domain + '/' + deleted)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataByDomainAndDeletedAndType = async (deleted, type) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdata/'+ domain + '/' + deleted + '/' + type)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataEvidentByType = async (deleted, type) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdataEvident/'+ domain + '/' + deleted + '/' + type)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus = async (deleted, type, status) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdata/'+ domain + '/' + deleted + '/' + type + '/' + status)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataEvidentById = async (logistik, id) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getEvidentbyid/'+ logistik + '/' + id)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataById = async (id) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getbyid/'+ id)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_CreateData = async (data) => {
  const response = await axios.post(API+'/api/Tr_teknis/Trteknis/create', data)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_CreateDataWithImages = async (data) => {
  const response = await axios.post(API+'/api/Tr_teknis/Trteknis/createimage', data)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_CreateDataEvidentWithImages = async (data) => {
  const response = await axios.put(API+'/api/Tr_teknis/Trteknis/updateWorkOrder', data)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_UpdateData = async (data, id) => {
  const response = await axios.put(API+'/api/Tr_teknis/Trteknis/updatebyid/'+ id, data)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_UpdateDataImage = async (data, id, kode) => {
  const response = await axios.put(API+'/api/Tr_teknis/Trteknis/updateEvidentbyid/'+ kode + '/' + id, data)
  var suppData = response.data;
  return suppData
}

// Utilities
export const getUtilByName = async (data) => {
  const response = await axios.get(API+'/api/utilities/byName/'+ data)
  var suppData = response.data;
  return suppData
}

// User Internal
export const getAllUsers = async () => {
  const response = await axios.get(API+'/api/userInternal/')
  var suppData = response.data;
  return suppData
}

export const createUser = async (data) => {
  const response = await axios.post(API+'/api/userInternal/create', data)
  var suppData = response.data;
  return suppData
}

export const updateUser = async (data, id) => {
  const response = await axios.put(API+'/api/userInternal/update/' + id, data)
  var suppData = response.data;
  return suppData
}

export const getUserById = async (id) => {
  const response = await axios.get(API+'/api/userInternal/detail/' + id)
  var suppData = response.data;
  return suppData
}

export const getUserInternalByRole = async (company, role) => {
  const newRole = role ? role : ""
  const response = await axios.get(API+'/api/userInternal/getUserByRole/'+company+'/'+newRole)
  var suppData = response.data;
  return suppData
}

// User Role
export const getAllRole = async (data) => {
  const response = await axios.get(API+'/api/role/', data)
  var suppData = response.data;
  return suppData
}
// Item
export const item_getAllItemWithStatus = async (company, status) => {
  const response = await axios.get(API+'/api/item/getAllItem/'+company+'/'+status)
  var suppData = response.data;
  return suppData
}
export const item_getItemById = async (id) => {
  const response = await axios.get(API+'/api/item/getItemById/'+ id)
  var suppData = response.data;
  return suppData
}
export const item_CreateDataWithImages = async (data) => {
  const response = await axios.post(API+'/api/item/createImage', data)
  var suppData = response.data;
  return suppData
}
export const item_UpdateDataWithImages = async (data, id) => {
  const response = await axios.put(API+'/api/item/updateImage/'+id, data)
  var suppData = response.data;
  return suppData
}

// Location
export const location_getAllLocationWithStatus = async (company, status) => {
  const response = await axios.get(API+'/api/location/getAllLocation/'+company+'/'+status)
  var suppData = response.data;
  return suppData
}