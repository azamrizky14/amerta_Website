import axios from "axios";
import { API } from "@/API/";

// General
export const uploadImage = async (file, location) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(API+`/api/Image/uploadTempImage/${location}`, formData);
  return response.data.filename;  // Mengembalikan nama file yang diupload
};

export const moveTempImage = async (file) => {
  const response = await axios.post(API+'/api/Image/moveTempImage', file);
  return response.data;  
};

export const removeTempImage = async (file) => {
  const response = await axios.post(API+'/api/Image/removeTempImage', file);
  return response.data;
};

export const moveMultiTempImage = async (file) => {
  const response = await axios.post(API+'/api/Image/moveMultiTempImage', file);
  return response.data;  
};

export const removeMultiTempImage = async (file) => {
  const response = await axios.post(API+'/api/Image/removeMultiTempImage', file);
  return response.data;
};
// User Internal
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
export const getAllUsersInternal = async () => {
  const response = await axios.get(API+'/api/userInternal/')
  var suppData = response.data;
  return suppData
}

export const createUserInternal = async (data) => {
  const response = await axios.post(API+'/api/userInternal/create', data)
  var suppData = response.data;
  return suppData
}

<<<<<<< HEAD
export const updateUserInternal = async (data, id) => {
  const response = await axios.put(API+'/api/userInternal/update/'+id, data)
=======
export const updateUser = async (data, id) => {
  const response = await axios.put(API+'/api/userInternal/update/' + id, data)
>>>>>>> 74a796ef147c1fa737d33ebec5a368803f122d08
  var suppData = response.data;
  return suppData
}

<<<<<<< HEAD
export const updateUserInternalJson = async (data, id) => {
  const response = await axios.put(API+'/api/userInternal/updateOne/'+id, data)
  var suppData = response.data;
  return suppData
}

export const getUserInternalById = async (id) => {
=======
export const getUserById = async (id) => {
>>>>>>> 74a796ef147c1fa737d33ebec5a368803f122d08
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

// User External
export const getAllUsersExternal = async () => {
  const response = await axios.get(API+'/api/userExternal/')
  var suppData = response.data;
  return suppData
}

export const createUserExternal = async (data) => {
  const response = await axios.post(API+'/api/userExternal/create', data)
  var suppData = response.data;
  return suppData
}

export const updateUserExternal = async (data, id) => {
  const response = await axios.put(API+'/api/userExternal/update/'+id, data)
  var suppData = response.data;
  return suppData
}

export const updateUserExternalJson = async (data, id) => {
  const response = await axios.put(API+'/api/userExternal/updateOne/'+id, data)
  var suppData = response.data;
  return suppData
}

export const getUserExternalById = async (id) => {
  const response = await axios.get(API+'/api/userExternal/detail/' + id)
  var suppData = response.data;
  return suppData
}

export const getUserExternalByRole = async (company, role) => {
  const newRole = role ? role : ""
  const response = await axios.get(API+'/api/userExternal/getUserByRole/'+company+'/'+newRole)
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
export const getAllRoleInternal = async (hierarchy) => {
  const response = await axios.get(API+'/api/role/roleInternal/'+hierarchy)
  var suppData = response.data;
  return suppData
}
export const getAllRoleExternal = async (hierarchy) => {
  const response = await axios.get(API+'/api/role/roleExternal/'+hierarchy)
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

export const lokasi_getDataNonGudangByType = async (company, type, name) => {
  const response = await axios.get(API+'/api/location/getLocationByType/'+company+'/'+type+'/'+name)
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
// PURCHASE ORDER
export const po_getAllDataWithoutItem = async (company, deleted, status) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPo/getdata/'+company+'/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}

export const po_getDataById = async (id) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPo/getDataById/'+id)
  var suppData = response.data;
  return suppData
}
export const po_getDataByPO = async (id) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPo/getDataByPO/'+id)
  var suppData = response.data;
  return suppData
}

export const po_GetPrefixByDate = async (date) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPo/getPoPrefix/'+date)
  var suppData = response.data;
  return suppData
}

export const po_GetTrPoListForGr = async (domain, hierarchy, deleted, status) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPo/getdataForGR/'+domain+'/'+hierarchy+'/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}

export const po_CreatePO = async (data) => {
  const response = await axios.post(API+'/api/Tr_purchase/TrPo/create', data)
  var suppData = response.data;
  return suppData
}

export const po_updateDataByPO = async (id, data) => {
  const response = await axios.put(API+'/api/Tr_purchase/TrPo/updatebyPO/'+id, data)
  var suppData = response.data;
  return suppData
}

// PURCHASE PAYMENT
export const pp_getAllData = async (deleted, status) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPp/getdataAll/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}

export const pp_getAllDataWithDomain = async (company, deleted, status) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPp/getdata/'+company+'/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}

export const pp_getDataById = async (id) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPp/getDataById/'+id)
  var suppData = response.data;
  return suppData
}

export const pp_GetPrefixByDate = async (date) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrPp/getPpPrefix/'+date)
  var suppData = response.data;
  return suppData
}

export const pp_CreatePP = async (data) => {
  const response = await axios.post(API+'/api/Tr_purchase/TrPp/create', data)
  var suppData = response.data;
  return suppData
}

export const pp_updateDataById = async (id, data) => {
  const response = await axios.put(API+'/api/Tr_purchase/TrPp/updatebyid/'+id, data)
  var suppData = response.data;
  return suppData
}
export const pp_updateDataWithImage = async (id, data) => {
  const response = await axios.put(API+'/api/Tr_purchase/TrPp/updateWithImage/'+id, data)
  var suppData = response.data;
  return suppData
}

// GOOD RECEIPT
export const gr_getAllDataWithoutItem = async (company, deleted, status) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrGr/getdata/'+company+'/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}
export const gr_GetPrefixByDate = async (date) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrGr/getGrPrefix/'+date)
  var suppData = response.data;
  return suppData
}
export const gr_GetTrGrListForQa = async (domain, hierarchy, deleted, status) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrGr/getdataForQa/'+domain+'/'+hierarchy+'/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}
export const gr_getDataById = async (id) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrGr/getDataById/'+id)
  var suppData = response.data;
  return suppData
}
export const gr_CreateGR = async (data) => {
  const response = await axios.post(API+'/api/Tr_purchase/TrGr/create', data)
  var suppData = response.data;
  return suppData
}
export const gr_CreateGRWithImage = async (data) => {
  const response = await axios.post(API+'/api/Tr_purchase/TrGr/createWithImage', data)
  var suppData = response.data;
  return suppData
}
export const gr_updateDataWithImage = async (id, data) => {
  const response = await axios.put(API+'/api/Tr_purchase/TrGr/updateWithImage/'+id, data)
  var suppData = response.data;
  return suppData
}
export const gr_updateGR = async (data, id) => {
  const response = await axios.put(API+'/api/Tr_purchase/TrGr/updatebyid/'+id, data)
  var suppData = response.data;
  return suppData
}
export const gr_updateGRbyGR = async (data, id) => {
  const response = await axios.put(API+'/api/Tr_purchase/TrGr/updatebyGR/'+id, data)
  var suppData = response.data;
  return suppData
}

// Quality Assurance
export const qa_getAllDataWithoutItem = async (company, deleted, status) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrQa/getdata/'+company+'/'+deleted+'/'+status)
  var suppData = response.data;
  return suppData
}
export const qa_getDataById = async (id) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrQa/getDataById/'+id)
  var suppData = response.data;
  return suppData
}
export const qa_GetPrefixByDate = async (date) => {
  const response = await axios.get(API+'/api/Tr_purchase/TrQa/getQaPrefix/'+date)
  var suppData = response.data;
  return suppData
}
export const qa_CreateQA = async (data) => {
  const response = await axios.post(API+'/api/Tr_purchase/TrQa/create', data)
  var suppData = response.data;
  return suppData
}

// Stock History

// Quality Assurance
export const stock_getAllData = async (company, deleted) => {
  const response = await axios.get(API+'/api/Stock/StockSh/getdata/'+company+'/'+deleted)
  var suppData = response.data;
  return suppData
}
// Quality Assurance
export const stock_getAllDataByLocation = async (company, deleted, location) => {
  const response = await axios.get(API+'/api/Stock/StockSh/getDataByLocation/'+company+'/'+deleted+'/'+location)
  var suppData = response.data;
  return suppData
}
export const stock_getDataForSO = async (company, deleted) => {
  const response = await axios.get(API+'/api/Stock/StockSo/getDataForSO/'+company+'/'+deleted)
  var suppData = response.data;
  return suppData
}

export const stock_CreateSh = async (data) => {
  const response = await axios.post(API+'/api/Stock/StockSh/create', data)
  var suppData = response.data;
  return suppData
}
export const stock_CreateSo = async (data) => {
  const response = await axios.post(API+'/api/Stock/StockSo/createSo', data)
  var suppData = response.data;
  return suppData
}

export const stock_GetPrefixByDate = async (date) => {
  const response = await axios.get(API+'/api/Stock/StockSo/getSoPrefix/'+date)
  var suppData = response.data;
  return suppData
}