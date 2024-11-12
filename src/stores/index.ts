    // src/stores/index.ts
import { defineStore } from 'pinia'
import { reactive } from 'vue'

interface User {
    [key: string]: any; // Allow any string key
    _id: string;
    companyCode: string[];
    email: string;
    hierarchyCode: string;
    userRole: string;
    userName: string;
    userAccess: string[];
    token: string;
    loginTime: string;
  }
  

interface Company {
  _id: string;
  companyCode: string[];
  companyDesc: string;
  companyLocation: string;
  companyName: string;
  companyPage: string[];
  companyLogo: string;
  logoName: string;
}

export const useIndexStore = defineStore('index', () => {
  const dataUser: User | null = JSON.parse(localStorage.getItem('user') || 'null')
  const user = reactive<User>({
    _id: dataUser?._id || '',
    companyCode: dataUser?.companyCode || [],
    email: dataUser?.email || '',
    hierarchyCode: dataUser?.hierarchyCode || '',
    userRole: dataUser?.userRole || '',
    userName: dataUser?.userName || '',
    userAccess: dataUser?.userAccess || [],
    token: dataUser?.token || '',
    loginTime: dataUser?.loginTime || ''
  })

  function setUser(userData: Partial<User>) {
    Object.assign(user, userData)
    localStorage.setItem('user', JSON.stringify(user))
  }

  function setToken(token: string) {
    user.token = token
    localStorage.setItem('token', token)
  }

  function setLoginTime(time: string) {
    user.loginTime = time
    localStorage.setItem('loginTime', time)
  }

  function clearUser() {
    Object.keys(user).forEach(key => {
      if (Array.isArray(user[key])) {
        user[key] = []
      } else {
        user[key] = ''
      }
    })
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('loginTime')
  }

  const dataCompany: Company | null = JSON.parse(localStorage.getItem('company') || 'null')
  const company = reactive<Company>({
    _id: dataCompany?._id || '',
    companyCode: dataCompany?.companyCode || [],
    companyDesc: dataCompany?.companyDesc || '',
    companyLocation: dataCompany?.companyLocation || '',
    companyName: dataCompany?.companyName || '',
    companyPage: dataCompany?.companyPage || [],
    companyLogo: dataCompany?.companyLogo || '',
    logoName: dataCompany?.logoName || ''
  })

  function setCompany(companyData: Partial<Company>) {
    Object.assign(company, companyData)
    localStorage.setItem('company', JSON.stringify(company))
  }

  function clearCompany() {
    Object.keys(company).forEach(key => {
      if (Array.isArray(company[key])) {
        company[key] = []
      } else {
        company[key] = ''
      }
    })
    localStorage.removeItem('company')
  }

  return {
    user,
    company,
    setCompany,
    setUser,
    setToken,
    setLoginTime,
    clearUser,
    clearCompany
  }
})
