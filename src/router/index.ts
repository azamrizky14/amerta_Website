import { createRouter, createWebHistory } from 'vue-router'

import { useIndexStore } from '@/stores/index'

const routes = [
  {
    path: '/',
    name: 'eCommerce',
    component: () => import('@/views/Dashboard/ECommerceView.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/views/CalendarView.vue'),
    meta: {
      title: 'Calendar',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'Profile',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/forms/form-elements',
    name: 'formElements',
    component: () => import('@/views/Forms/FormElementsView.vue'),
    meta: {
      title: 'Form Elements',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/forms/form-layout',
    name: 'formLayout',
    component: () => import('@/views/Forms/FormLayoutView.vue'),
    meta: {
      title: 'Form Layout',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/tables',
    name: 'tables',
    component: () => import('@/views/TablesView.vue'),
    meta: {
      title: 'Tables',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/pages/settings',
    name: 'settings',
    component: () => import('@/views/Pages/SettingsView.vue'),
    meta: {
      title: 'Settings',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/charts/basic-chart',
    name: 'basicChart',
    component: () => import('@/views/Charts/BasicChartView.vue'),
    meta: {
      title: 'Basic Chart',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/ui-elements/alerts',
    name: 'alerts',
    component: () => import('@/views/UiElements/AlertsView.vue'),
    meta: {
      title: 'Alerts',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/ui-elements/buttons',
    name: 'buttons',
    component: () => import('@/views/UiElements/ButtonsView.vue'),
    meta: {
      title: 'Buttons',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Authentication/LoginView.vue'),
    meta: {
      title: 'Login',
    }
  },
  {
    path: '/auth/signin',
    name: 'signin',
    component: () => import('@/views/Authentication/SigninView.vue'),
    meta: {
      title: 'Signin',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/auth/signup',
    name: 'signup',
    component: () => import('@/views/Authentication/SignupView.vue'),
    meta: {
      title: 'Signup',
      requiresAuth: true // Add this line to protect this route
    }
  },

  // Modules
  
  // BON & Material
  {
    path: '/modules/work-order/bon-dan-material',
    name: 'woBon',
    component: () => import('@/views/Modules/WorkOrder_bon_dan_material.vue'),
    meta: {
      title: 'Bon & Material',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/bon-dan-material/add',
    name: 'woBonAdd',
    component: () => import('@/views/Modules/WorkOrder_bon_dan_material_add.vue'),
    meta: {
      title: 'Create Bon & Material',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/bon-dan-material/detail/:id',
    name: 'woBonDetail',
    component: () => import('@/views/Modules/WorkOrder_bon_dan_material_detail.vue'),
    meta: {
      title: 'Detail Bon & Material',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/bon-dan-material/closing/:id',
    name: 'woBonClosing',
    component: () => import('@/views/Modules/WorkOrder_bon_dan_material_closing.vue'),
    meta: {
      title: 'Closing Bon & Material',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Evident PSB
  {
    path: '/modules/work-order/evident/psb',
    name: 'evidentPsb',
    component: () => import('@/views/Modules/WorkOrder_evident_psb.vue'),
    meta: {
      title: 'Evident PSB',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/psb/add',
    name: 'EvidentPsbAdd',
    component: () => import('@/views/Modules/WorkOrder_evident_psb_add.vue'),
    meta: {
      title: 'Evident PSB Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/psb/detail/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentPsbDetail',
    component: () => import('@/views/Modules/WorkOrder_evident_psb_detail.vue'),
    meta: {
      title: 'Evident PSB Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/psb/edit/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentPsbEdit',
    component: () => import('@/views/Modules/WorkOrder_evident_psb_edit.vue'),
    meta: {
      title: 'Evident PSB Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Evident MT
  {
    path: '/modules/work-order/evident/mt',
    name: 'evidentMt',
    component: () => import('@/views/Modules/WorkOrder_evident_mt.vue'),
    meta: {
      title: 'Evident MT',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/mt/add',
    name: 'EvidentMtAdd',
    component: () => import('@/views/Modules/WorkOrder_evident_mt_add.vue'),
    meta: {
      title: 'Evident MT Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/mt/detail/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentMtDetail',
    component: () => import('@/views/Modules/WorkOrder_evident_mt_detail.vue'),
    meta: {
      title: 'Evident MT Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/mt/edit/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentMtEdit',
    component: () => import('@/views/Modules/WorkOrder_evident_mt_edit.vue'),
    meta: {
      title: 'Evident MT Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Evident PWS
  {
    path: '/modules/work-order/evident/pws',
    name: 'evidentPws',
    component: () => import('@/views/Modules/WorkOrder_evident_pws.vue'),
    meta: {
      title: 'Evident PWS',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/pws/add',
    name: 'EvidentPwsAdd',
    component: () => import('@/views/Modules/WorkOrder_evident_pws_add.vue'),
    meta: {
      title: 'Evident PWS Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/pws/detail/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentPwsDetail',
    component: () => import('@/views/Modules/WorkOrder_evident_pws_detail.vue'),
    meta: {
      title: 'Evident PWS Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/pws/edit/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentPwsEdit',
    component: () => import('@/views/Modules/WorkOrder_evident_pws_edit.vue'),
    meta: {
      title: 'Evident PWS Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Evident WNJ
  {
    path: '/modules/work-order/evident/wnj',
    name: 'evidentWnj',
    component: () => import('@/views/Modules/WorkOrder_evident_wnj.vue'),
    meta: {
      title: 'Evident WNJ',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/wnj/add',
    name: 'EvidentWnjAdd',
    component: () => import('@/views/Modules/WorkOrder_evident_wnj_add.vue'),
    meta: {
      title: 'Evident WNJ Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/wnj/detail/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentWnjDetail',
    component: () => import('@/views/Modules/WorkOrder_evident_wnj_detail.vue'),
    meta: {
      title: 'Evident WNJ Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/wnj/edit/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentWnjEdit',
    component: () => import('@/views/Modules/WorkOrder_evident_wnj_edit.vue'),
    meta: {
      title: 'Evident WNJ Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Evident INFRA
  {
    path: '/modules/work-order/evident/infra',
    name: 'evidentInfra',
    component: () => import('@/views/Modules/WorkOrder_evident_infra.vue'),
    meta: {
      title: 'Evident INFRA',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/infra/add',
    name: 'EvidentInfraAdd',
    component: () => import('@/views/Modules/WorkOrder_evident_infra_add.vue'),
    meta: {
      title: 'Evident INFRA Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/infra/detail/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentInfraDetail',
    component: () => import('@/views/Modules/WorkOrder_evident_infra_detail.vue'),
    meta: {
      title: 'Evident INFRA Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/evident/infra/edit/:logistikType/:logistikDate/:logistikNumber/:id',
    name: 'EvidentInfraEdit',
    component: () => import('@/views/Modules/WorkOrder_evident_infra_edit.vue'),
    meta: {
      title: 'Evident INFRA Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
  // Gudang
  {
    path: '/modules/work-order/gudang',
    name: 'woGudang',
    component: () => import('@/views/Modules/WorkOrder_gudang.vue'),
    meta: {
      title: 'Gudang',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/gudang/detail/:id',
    name: 'woGudangDetail',
    component: () => import('@/views/Modules/WorkOrder_gudang_detail.vue'),
    meta: {
      title: 'Gudang Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
  {
    path: '/modules/work-order/purchase/po',
    name: 'woPurchaseOrder',
    component: () => import('@/views/Modules/WorkOrder_purchase_po.vue'),
    meta: {
      title: 'Purchase Order',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/purchase/po/add',
    name: 'woPurchaseOrderAdd',
    component: () => import('@/views/Modules/WorkOrder_purchase_po_add.vue'),
    meta: {
      title: 'Purchase Order Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/work-order/purchase/po/detail/:id',
    name: 'woPurchaseOrderDetail',
    component: () => import('@/views/Modules/WorkOrder_purchase_po_detail.vue'),
    meta: {
      title: 'Purchase Order Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
  // Master User Internal
  {
    path: '/modules/master/user-internal',
    name: 'userInternal',
    component: () => import('@/views/Master/Master_userInternal.vue'),
    meta: {
      title: 'Master User Internal',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-internal/add',
    name: 'userInternalAdd',
    component: () => import('@/views/Master/Master_userInternal_add.vue'),
    meta: {
      title: 'Master User Internal Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-internal/detail/:id',
    name: 'userInternalDetail',
    component: () => import('@/views/Master/Master_userInternal_detail.vue'),
    meta: {
      title: 'Master User Internal Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },

  // Master User Role
  {
    path: '/modules/master/user-role',
    name: 'userRole',
    component: () => import('@/views/Master/Master_userRole.vue'),
    meta: {
      title: 'Master User Role',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Master Item
  {
    path: '/master/item',
    name: 'masterItem',
    component: () => import('@/views/Master/Master_item.vue'),
    meta: {
      title: 'Master Item',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/master/item/add',
    name: 'masterItemAdd',
    component: () => import('@/views/Master/Master_item_add.vue'),
    meta: {
      title: 'Master Item Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Master Item
  {
    path: '/master/item',
    name: 'masterItem',
    component: () => import('@/views/Master/Master_item.vue'),
    meta: {
      title: 'Master Item',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/master/item/add',
    name: 'masterItemAdd',
    component: () => import('@/views/Master/Master_item_add.vue'),
    meta: {
      title: 'Master Item Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/master/item/detail/:id',
    name: 'masterItemDetail',
    component: () => import('@/views/Master/Master_item_detail.vue'),
    meta: {
      title: 'Master Item Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/master/item/edit/:id',
    name: 'masterItemEdit',
    component: () => import('@/views/Master/Master_item_edit.vue'),
    meta: {
      title: 'Master Item Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
  // Master Lokasi  
  {
    path: '/master/location',
    name: 'masterLokasi',
    component: () => import('@/views/Master/Master_lokasi.vue'),
    meta: {
      title: 'Master Lokasi',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/master/location/add',
    name: 'masterLokasiAdd',
    component: () => import('@/views/Master/Master_lokasi_add.vue'),
    meta: {
      title: 'Master Lokasi Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/master/location/detail/:id',
    name: 'masterLokasiDetail',
    component: () => import('@/views/Master/Master_lokasi_detail.vue'),
    meta: {
      title: 'Master Lokasi Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/master/location/edit/:id',
    name: 'masterLokasiEdit',
    component: () => import('@/views/Master/Master_lokasi_edit.vue'),
    meta: {
      title: 'Master Item Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Amerta`
  
  const token = localStorage.getItem('token')
  const loginTime = localStorage.getItem('loginTime')
  const company = localStorage.getItem('company')
  const indexStore = useIndexStore()

  // Check if the user is trying to access the login page
  if (to.name === 'login') {
    // Check if the user is already logged in
    if (token && loginTime) {
      // Redirect to the dashboard
      next({ name: 'eCommerce' })
    } else {
      // Continue to the login page
      next()
    }
  } else {
    // Check if the route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
      if (!token || !loginTime) {
        next({ name: 'login' })
      } else {
        const currentTime = new Date().toISOString()
        const timeDifference = new Date(currentTime) - new Date(loginTime)

        if (timeDifference > 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
          indexStore.clearUser()
          indexStore.clearCompany()
          localStorage.removeItem('token')
          localStorage.removeItem('loginTime')
          next({ name: 'login' })
        } else {
          next()
        }
      }
    } else {
      next()
    }
  }
})

export default router
