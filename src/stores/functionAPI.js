import axios from "axios";
import { API } from "@/API/";

export const userInternal_Login = async (data) => {
  const response = await axios.post(API+'/api/userInternal/login', data)
  var suppData = response.data;
  return suppData
}

// Bon & Material
export const BonMaterial_GetPrefixByTypeAndDate = async (type, date, domain) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getBonPrefix/'+ type + '/' +date+  '/' +domain)
  var suppData = response.data;
  return suppData
}

// Admin Teknisi
export const adminTeknis_GetDataByDomainAndDeleted = async (deleted, domain, hierarchy) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdata/'+ domain + '/' + hierarchy + '/' + deleted)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataByDomainAndDeletedAndType = async (deleted, type, domain) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdata/'+ domain + '/' + deleted + '/' + type)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataEvidentByType = async (deleted, type, domain, hierarchy) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdataEvident/'+ domain + '/' + hierarchy + '/' + deleted + '/' + type)
  var suppData = response.data;
  return suppData
}

export const adminTeknis_GetDataByDomainAndDeletedAndTypeAndStatus = async (deleted, type, status, domain, hierarchy) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getdata/'+ domain + '/' + hierarchy + '/' + deleted + '/' + type + '/' + status)
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

export const adminTeknis_GetTotalDataPerMonth = async (domain, hierarchy,  type, month) => {
  const response = await axios.get(API+'/api/Tr_teknis/Trteknis/getTotalData/'+ domain + '/' + hierarchy +'/'+ type + '/' + month)
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

// Company
export const company_getDataByCode = async (code) => {
  const response = await axios.get(API+'/api/company/detailByCode/'+ code)
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
export const item_getAllItemWithStatus = async (company, hierarchy, status) => {
  const response = await axios.get(API+'/api/item/getAllItem/'+company+'/'+hierarchy+'/'+status)
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
export const lokasi_getAllLocationWithStatus = async (domain, hierarchy, status) => {
  const response = await axios.get(API+'/api/location/getAllLocation/'+domain+'/'+hierarchy+'/'+status)
  var suppData = response.data;
  return suppData
}
export const lokasi_getDataByType = async (type, name) => {
  const response = await axios.get(API+'/api/location/getLocationByType/'+type+'/'+name)
  var suppData = response.data;
  return suppData
}

export const lokasi_getDataById = async (id) => {
  const response = await axios.get(API+'/api/location/getLocationById/'+id)
  var suppData = response.data;
  return suppData
}

export const lokasi_CreateData = async (data) => {
  const response = await axios.post(API+'/api/location/create', data)
  var suppData = response.data;
  return suppData
}

export const lokasi_UpdateData = async (data, id) => {
  const response = await axios.put(API+'/api/location/update/'+id, data)
  var suppData = response.data;
  return suppData
}

// Purchase

export const po_getAllDataWithoutItem = async (company, deleted, status) => {
  const response = await axios.get(API+'/api/Tr_po/TrPo/getdata/'+company+'/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}

export const po_getDataById = async (id) => {
  const response = await axios.get(API+'/api/Tr_po/TrPo/getDataById/'+id)
  var suppData = response.data;
  return suppData
}

export const po_GetPrefixByDate = async (date) => {
  const response = await axios.get(API+'/api/Tr_po/TrPo/getPoPrefix/'+date)
  var suppData = response.data;
  return suppData
}

export const po_CreatePO = async (data) => {
  const response = await axios.post(API+'/api/Tr_po/TrPo/create', data)
  var suppData = response.data;
  return suppData
}
