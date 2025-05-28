<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import {
  pp_getAllData,
  pp_getAllDataWithDomain,
  pp_updateDataById,
  pp_updateDataWithImage,
  po_updateDataByPO,
  pp_getDataById,
} from "@/stores/functionAPI";
import {
  mdiEyeOutline,
  mdiMagnify,
  mdiRefresh,
  mdiPlusCircleOutline,
  mdiCash,
  mdiCashOff,
  mdiTruckFast,
} from "@mdi/js";
import { useIndexStore } from "@/stores";
import { formatDate, getDateToday } from "@/stores/date";
import Swal from "sweetalert2";

const pageTitle = ref("Purchase - Payment");
const pageList = ref(["Work Order", "Purchase", "Payment"]);
const dataHeader = ref([
  { name: "No.", class: "py-2 pl-3" },
  { name: "Kode Payment", class: "min-w-[75px] py-2 px-4" },
  { name: "Kode PO", class: "min-w-[75px] py-2 px-4" },
  { name: "Tgl. Dibuat", class: "min-w-[105px] py-2 px-4" },
  { name: "Tgl. Bayar", class: "min-w-[100px] py-2 px-4" },
  { name: "PIC", class: "py-2 px-4" },
  { name: "Total", class: "min-w-[100px] py-2 px-4" },
  { name: "Shipment", class: "py-2 px-2" },
  { name: "Status", class: "py-2 px-2" },
]);

let dataTable = ref([]);
const indexStore = useIndexStore();
const searchQuery = ref("");

// Pagination state
const currentPage = ref(1);
const itemsPerPageOptions = [5, 10, 20, 50]; // Pilihan jumlah data per halaman
const itemsPerPage = ref(5);
const pageInput = ref(currentPage.value);

watch(itemsPerPage, () => {
  currentPage.value = 1; // Reset to the first page
});

const jumpToPage = () => {
  if (pageInput.value >= 1 && pageInput.value <= totalPages.value) {
    changePage(pageInput.value);
  } else {
    // Reset to the current page if input is invalid
    pageInput.value = currentPage.value;
  }
};

// Filtered data based on search query
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return dataTable.value;
  return dataTable.value.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const visiblePages = computed(() => {
  const pages = [];
  const range = 2; // Number of pages to show before and after the current page

  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const optionsPayment: Option[] = [
  { id: 1, name: "Cash" },
  { id: 2, name: "Bank" },
  { id: 3, name: "Utang" },
];

// Total items based on the filtered data
const totalItems = computed(() => filteredData.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

// Paginated data based on filtered results
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredData.value.slice(start, end);
});

// Change page function
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const totalPaid = (total, ship, ins) => {
  const data = total ? total : 0 + ship ? ship : 0 + ins ? ins : 0;

  return data.toLocaleString();
};

const formatNumber = (value) => {
  const data = Number(value).toLocaleString("id-ID"); // Gunakan "id-ID" untuk format Indonesia
  return data;
};

const alertCancel = async (data) => {
  const { value: text } = await Swal.fire({
    title: "Batalkan Purchase Order",
    text: "Ketik 'Batalkan Pesanan' untuk melanjutkan",
    input: "text",
    inputPlaceholder: "Tulis 'Batalkan Pesanan' di sini...",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
    inputValidator: (value) => {
      if (value !== "Batalkan Pesanan") {
        return "Ketik Dengan Tepat: 'Batalkan Pesanan'";
      }
    },
    didOpen: () => {
      const input = Swal.getInput();
      if (input) input.setAttribute("autocomplete", "off");
    },
  });

  if (text === "Batalkan Pesanan") {
    // Lanjutkan proses hapus di sini
    try {
      const fixedData = {
        Tr_pp_user_paid: indexStore.user.userName,
        Tr_pp_payment_date: await getDateToday("yyyy-MM-dd"),
        Tr_pp_payment_method: "",
        Tr_pp_status: "rejected",
      };

      await pp_updateDataById(data._id, fixedData);
      await po_updateDataByPO(data.Tr_po_id, { Tr_po_status: "cancel" });
      await getData();
      Swal.fire("Dibatalkan!", "Pesanan berhasil dibatalkan.", "success");
      // } catch (error) {
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  }
};

const alertPayment = async (id) => {
  const savedData = await pp_getDataById(id);
  if (!savedData.Tr_pp_payment_detail.Tr_pp_payment_shipping)
    savedData.Tr_pp_payment_detail.Tr_pp_payment_shipping = "";
  if (!savedData.Tr_pp_payment_detail.Tr_pp_payment_insurance)
    savedData.Tr_pp_payment_detail.Tr_pp_payment_insurance = "";
  if (!savedData.Tr_pp_payment_method) savedData.Tr_pp_payment_method = "";
  await Swal.fire({
    title: "Pembayaran PO",
    html: `
      <div class="flex pt-5 justify-between flex-wrap">
        <div class="w-1/2">
          <div class="relative w-full mt-2">
            <label
              for="shipping"
              class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
            >
              Shipping
            </label>
            <input
              type="number"
              id="shipping"
              class="font-semibold w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              value="${savedData.Tr_pp_payment_detail.Tr_pp_payment_shipping}"
            />
          </div>

          <div class="relative w-full mt-4">
            <label
              for="insurance"
              class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
            >
              Insurance
            </label>
            <input
              type="number"
              id="insurance"
              class="font-semibold w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              value="${savedData.Tr_pp_payment_detail.Tr_pp_payment_insurance}"
            />
          </div>

          <div class="relative w-full mt-4">
            <label
              for="payment-method"
              class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
            >
              Payment Method
            </label>
            <select id="payment-method" class="font-semibold w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500">
              <option value="" disabled ${
                savedData.Tr_pp_payment_method === "" ? "selected" : ""
              }>Metode Pembayaran</option>
              ${optionsPayment
                .map(
                  (opt) =>
                    `<option value="${opt.name}" ${
                      savedData.Tr_pp_payment_method === opt.name ? "selected" : ""
                    }>${opt.name}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>
        <div class="w-1/2 text-sm pl-5">
          <p class="flex justify-between pb-1">
            <span>Sub Total : </span>
            <span>Rp. ${formatNumber(
              savedData.Tr_pp_payment_detail.Tr_pp_payment_total
            )}</span>
          <p>
          <p class="flex justify-between pb-1">
            <span>Discount : </span>
            <span>(Rp. ${formatNumber(
              savedData.Tr_pp_payment_detail.Tr_pp_payment_discount
            )})</span>
          <p>
          <p class="flex justify-between pb-1">
            <span>Tax : </span>
            <span>Rp. ${formatNumber(
              savedData.Tr_pp_payment_detail.Tr_pp_payment_tax
            )}</span>
          <p>
          <p class="flex justify-between pb-1">
            <span>Shipment : </span>
            <span>Rp. <span id="shippingValue"></span></span>
          <p>
          <p class="flex justify-between pb-1">
            <span>Insurance : </span>
            <span>Rp. <span id="insuranceValue"></span></span>
          <p>
          <p class="flex justify-between pb-1">
            <span>Total : </span>
            <span class="font-bold">Rp. <span id="totalValue"></span></span>
          <p>
        </div>

        <div class="relative w-full mt-4">
            <label
              for="image"
              class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
            >
              Bukti Pembayaran
            </label>
            <input
              type="file"
              accept="image/*"
              id="image"
              class="font-semibold w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
              value="${savedData.Tr_pp_image}"
            />
          </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Bayar",
    confirmButtonColor: "#10B981",
    didOpen: () => {
      const shippingInput = document.getElementById("shipping");
      const insuranceInput = document.getElementById("insurance");
      const paymentMethodInput = document.getElementById("payment-method");
      const shippingValue = document.getElementById("shippingValue");
      const insuranceValue = document.getElementById("insuranceValue");
      const totalValue = document.getElementById("totalValue");

      function handleInputChange() {
        const shipping = shippingInput.value ? Number(shippingInput.value) : 0;
        const insurance = insuranceInput.value ? Number(insuranceInput.value) : 0;
        const amount = savedData.Tr_pp_payment_amount
          ? Number(savedData.Tr_pp_payment_amount)
          : 0;

        const data = shipping + insurance + amount;
        totalValue.textContent = formatNumber(data);
      }

      shippingValue.textContent = formatNumber(shippingInput.value);
      insuranceValue.textContent = formatNumber(insuranceInput.value);
      handleInputChange();
      // Menangkap perubahan input secara real-time

      shippingInput.addEventListener("input", (e) => {
        savedData.Tr_pp_payment_detail.Tr_pp_payment_shipping = e.target.value;
        shippingValue.textContent = formatNumber(e.target.value);
        handleInputChange();
      });

      insuranceInput.addEventListener("input", (e) => {
        savedData.Tr_pp_payment_detail.Tr_pp_payment_insurance = e.target.value;
        insuranceValue.textContent = formatNumber(e.target.value);
        handleInputChange();
      });

      paymentMethodInput.addEventListener("change", (e) => {
        savedData.Tr_pp_payment_method = e.target.value;
      });
    },
    preConfirm: () => {
      const paymentMethodInput = document.getElementById("payment-method");
      const paymentMethod = paymentMethodInput.value;

      const imageInput = document.getElementById("image");
      const image = imageInput.files[0];

      if (!paymentMethod) {
        Swal.showValidationMessage("Metode pembayaran harus diisi!");
        return false;
      }

      if (!image) {
        Swal.showValidationMessage("Bukti Pembayaran harus ada!");
        return false;
      }

      savedData.Tr_pp_payment_method = paymentMethod;
      savedData.Tr_pp_image = image;

      return { ...savedData };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const fixedData = {
          Tr_pp_user_paid: indexStore.user.userName,
          Tr_pp_payment_date: await getDateToday("yyyy-MM-dd"),
          Tr_pp_payment_detail: savedData.Tr_pp_payment_detail,
          Tr_pp_payment_method: savedData.Tr_pp_payment_method,
          Tr_pp_status: "paid",
        };
        fixedData.Tr_pp_payment_detail.Tr_pp_payment_shipping = Number(
          fixedData.Tr_pp_payment_detail.Tr_pp_payment_shipping
        );
        fixedData.Tr_pp_payment_detail.Tr_pp_payment_insurance = Number(
          fixedData.Tr_pp_payment_detail.Tr_pp_payment_insurance
        );

        let total = 0;
        const deductionFields = ["Tr_pp_payment_discount"];

        Object.entries(fixedData.Tr_pp_payment_detail).forEach(([key, value]) => {
          const num = Number(value) || 0;

          if (deductionFields && deductionFields.includes(key)) {
            total -= num;
          } else {
            total += num;
          }
        });
        fixedData.Tr_pp_shipment = {};
        fixedData.Tr_pp_payment_amount = Number(total);
        const Tr_pp_item = savedData.Tr_po_item.map((x) => ({
          ...x,
          item_jumlah_gr: x.item_jumlah,
          item_jumlah_qa: x.item_jumlah,
        }));
        const formData = new FormData();
        formData.append("Tr_pp_image", savedData.Tr_pp_image); // file bisa didapat dari event.target.files[0]
        await pp_updateDataById(savedData._id, fixedData);
        await pp_updateDataWithImage(savedData.Tr_pp_id, formData);
        await po_updateDataByPO(savedData.Tr_po_id, {
          Tr_po_status: "process",
          Tr_po_shipment: {},
          Tr_pp_item: Tr_pp_item,
        });
        await getData();
        Swal.fire("Sukses!", "Data telah disimpan.", "success");
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }
    }
  });
};

const alertShipment = async (id, status) => {
  const savedData = await pp_getDataById(id);
  let shipmentDetail;

  if (status === "preview") {
    shipmentDetail = savedData.Tr_pp_shipment;
  } else {
    shipmentDetail = {
      Tr_pp_shipment_courier: "",
      Tr_pp_shipment_number: "",
      Tr_pp_shipment_date: "",
    };
  }
  await Swal.fire({
    title: "Data Shipment",
    html: `
      <div class="flex pt-5 justify-between flex-wrap">
        <div class="w-full">
          <div class="relative w-full mt-2">
            <label
              for="ShipCourier"
              class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
            >
              Kurir
            </label>
            <input
              type="text"
              id="ShipCourier"
              class="font-semibold w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
              value="${shipmentDetail.Tr_pp_shipment_courier}"
              ${status === "preview" ? "disabled" : ""}
            />
          </div>

          <div class="relative w-full mt-4">
            <label
              for="ShipNumber"
              class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
            >
              No. Resi
            </label>
            <input
              type="text"
              id="ShipNumber"
              class="font-semibold w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
              value="${shipmentDetail.Tr_pp_shipment_number}"
              ${status === "preview" ? "disabled" : ""}
            />
          </div>

          <div class="relative w-full mt-4">
            <label
              for="ShipDate"
              class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
            >
              Estimasi Kedatangan
            </label>
            <input
              type="date"
              id="ShipDate"
              class="font-semibold w-full border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500"
              value="${shipmentDetail.Tr_pp_shipment_date}"
              ${status === "preview" ? "disabled" : ""}
            />
          </div>
        </div>
      </div>
    `,
    focusConfirm: false,
    cancelButtonText: status === "preview" ? "Kembali" : "Batal",
    showConfirmButton: status !== "preview",
    showCancelButton: true,
    confirmButtonText: "Bayar",
    confirmButtonColor: "#10B981",
    didOpen: () => {
      const ShipCourier = document.getElementById("ShipCourier");
      const ShipNumber = document.getElementById("ShipNumber");
      const ShipDate = document.getElementById("ShipDate");
      // Menangkap perubahan input secara real-time

      ShipCourier.addEventListener("input", (e) => {
        shipmentDetail.Tr_pp_shipment_courier = e.target.value;
      });

      ShipNumber.addEventListener("input", (e) => {
        shipmentDetail.Tr_pp_shipment_number = e.target.value;
      });

      ShipDate.addEventListener("change", (e) => {
        shipmentDetail.Tr_pp_shipment_date = e.target.value;
      });
    },
    preConfirm: () => {
      const ShipCourier = document.getElementById("ShipCourier");
      const ShipNumber = document.getElementById("ShipNumber");
      const ShipDate = document.getElementById("ShipDate");

      if (!ShipCourier.value) {
        Swal.showValidationMessage("Kurir harus diisi!");
        return false;
      }
      if (!ShipNumber.value) {
        Swal.showValidationMessage("No. Resi harus diisi!");
        return false;
      }
      if (!ShipDate.value) {
        Swal.showValidationMessage("Tgl. Perkiraan Kedatangan harus diisi!");
        return false;
      }

      return;
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await pp_updateDataById(savedData._id, { Tr_pp_shipment: shipmentDetail });
        await po_updateDataByPO(savedData.Tr_po_id, {
          Tr_po_shipment: {
            Tr_po_shipment_courier: shipmentDetail.Tr_pp_shipment_courier,
            Tr_po_shipment_number: shipmentDetail.Tr_pp_shipment_number,
            Tr_po_shipment_date: shipmentDetail.Tr_pp_shipment_date,
          },
        });
        await getData();
        Swal.fire("Sukses!", "Data telah disimpan.", "success");
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }
    }
  });
};

// Change page function
const getData = async () => {
  let data;
  if (
    indexStore.user.hierarchyCode <= 1.2 ||
    indexStore.user.userRole === "Admin Keuangan"
  ) {
    data = await pp_getAllData("N", "");
  } else {
    data = await pp_getAllDataWithDomain(
      indexStore.user.companyCode,
      indexStore.user.hierarchyCode,
      "N",
      indexStore.user.hierarchyCode
    );
  }

  dataTable.value = await Promise.all(
    data.map(async (pp) => ({
      ...pp,
      formattedCreate: pp.Tr_pp_created_date
        ? await formatDate(pp.Tr_pp_created_date, "dd-MM-yyyy")
        : "",
      formattedNeed: pp.Tr_pp_payment_date
        ? await formatDate(pp.Tr_pp_payment_date, "dd-MM-yyyy")
        : "",
    }))
  );
};
onMounted(async () => {
  await getData();
});
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <div class="flex flex-col gap-10">
      <div
        class="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5"
      >
        <!-- Search and Helper -->
        <div
          class="helper border-2 flex justify-between bg-gray-2 text-left dark:bg-meta-4 text-black dark:text-white py-2 px-4"
        >
          <div class="left-data">
            <div class="relative">
              <button class="absolute top-1/2 left-0 -translate-y-1/2">
                <svg
                  class="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiMagnify" fill="" />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                class="w-full xl:w-125 bg-transparent pr-4 pl-9 focus:outline-none"
                v-model="searchQuery"
              />
            </div>
          </div>
          <div class="right-data flex items-center flex-row-reverse">
            <!-- Add Button -->
            <router-link to="/modules/work-order/purchase/pp/add" class="px-1 hidden">
              <svg
                class="fill-current hover:text-primary"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path :d="mdiPlusCircleOutline" fill="" />
              </svg>
            </router-link>
            <!-- Refresh Button -->
            <button class="px-1" @click="getData()">
              <svg
                class="fill-current hover:text-primary"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path :d="mdiRefresh" fill="" />
              </svg>
            </button>
          </div>
        </div>

        <div class="max-w-full overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th
                  v-for="data in dataHeader"
                  :class="data.class"
                  class="font-medium text-black dark:text-white text-center text-sm"
                >
                  {{ data.name }}
                </th>
                <th class="py-2 px-4 font-medium text-black dark:text-white text-center">
                  Opsi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(po, index) in paginatedData" :key="index" class="border">
                <td class="pl-3 py-1.5 text-xs border align-top">
                  {{ index + 1 }}
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-black dark:text-white text-xs text-center">
                    {{ po.Tr_pp_id }}
                  </p>
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-black dark:text-white text-xs text-center">
                    <router-link
                      target="_blank"
                      class="text-primary hover:font-semibold"
                      :to="'/modules/work-order/purchase/po/detail/' + po.Tr_po_id"
                    >
                      {{ po.Tr_po_id }}
                    </router-link>
                  </p>
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-black dark:text-white text-xs text-center">
                    {{ po.formattedCreate }}
                  </p>
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-xs text-black dark:text-white text-center">
                    {{ po.formattedNeed }}
                  </p>
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-xs text-black dark:text-white">
                    {{ po.Tr_pp_user_paid }}
                  </p>
                </td>
                <td class="py-1.5 px-2 border align-top">
                  <p class="text-black dark:text-white text-xs font-semibold text-right">
                    Rp.
                    {{ formatNumber(po.Tr_pp_payment_amount) }}
                  </p>
                </td>
                <td class="text-center border pt-0 pb-1 px-2 align-top">
                  <p
                    class="inline-flex rounded-full bg-opacity-10 pt-0 pb-1 px-3 text-xs font-semibold cursor-pointer text-primary"
                    @click="alertShipment(po._id, 'preview')"
                  >
                    {{
                      po.Tr_pp_shipment && po.Tr_pp_shipment.Tr_pp_shipment_courier
                        ? po.Tr_pp_shipment.Tr_pp_shipment_courier
                        : ""
                    }}
                  </p>
                </td>
                <td class="text-center border pt-0 pb-1 px-2 align-top">
                  <p
                    class="inline-flex rounded-full bg-opacity-10 pt-0 pb-1 px-3 text-xs font-medium"
                    :class="{
                      'bg-warning text-warning': po.Tr_pp_status === 'process',
                      'bg-danger text-danger': po.Tr_pp_status === 'rejected',
                      'bg-success text-success': po.Tr_pp_status === 'paid',
                    }"
                  >
                    {{ po.Tr_pp_status }}
                  </p>
                </td>
                <td class="py-1 px-2 align-top">
                  <div class="flex items-center space-x-2.5 d-flex justify-center">
                    <router-link
                      class="hover:text-primary"
                      :to="'/modules/work-order/purchase/pp/detail/' + po._id"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path :d="mdiEyeOutline" fill="" />
                      </svg>
                    </router-link>

                    <button
                      :class="
                        po.Tr_pp_status === 'process' ? 'hover:text-primary' : 'hidden'
                      "
                      @click="alertPayment(po._id)"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path :d="mdiCash" fill="" />
                      </svg>
                    </button>

                    <button
                      :class="
                        po.Tr_pp_status === 'process' ? 'hover:text-primary' : 'hidden'
                      "
                      @click="alertCancel(po)"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path :d="mdiCashOff" fill="" />
                      </svg>
                    </button>

                    <button
                      :class="
                        po.Tr_pp_status === 'paid' &&
                        po.Tr_pp_shipment &&
                        Object.keys(po.Tr_pp_shipment).length === 0
                          ? 'hover:text-primary'
                          : 'hidden'
                      "
                      @click="alertShipment(po._id)"
                    >
                      <svg
                        class="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path :d="mdiTruckFast" fill="" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-between items-center">
          <!-- Menampilkan Data -->
          <div class="flex items-center text-sm">
            <label for="itemsPerPage" class="mr-2">Menampilkan</label>
            <select
              id="itemsPerPage"
              v-model="itemsPerPage"
              class="px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
            <span class="ml-2">dari {{ totalItems }} data</span>
          </div>

          <!-- Navigasi Pagination -->
          <div class="flex space-x-2 items-center">
            <!-- Previous Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Prev
            </button>

            <!-- First Page -->
            <button
              v-if="currentPage > 3"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(1)"
            >
              1
            </button>

            <!-- Ellipsis Before -->
            <span v-if="currentPage > 4" class="text-xs px-2 py-1">...</span>

            <!-- Visible Page Buttons -->
            <button
              v-for="page in visiblePages"
              :key="page"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :class="currentPage === page ? 'bg-primary text-white' : ''"
              @click="changePage(page)"
            >
              {{ page }}
            </button>

            <!-- Ellipsis After -->
            <span v-if="currentPage < totalPages - 3" class="text-xs px-2 py-1">...</span>

            <!-- Last Page -->
            <button
              v-if="currentPage < totalPages - 2"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <!-- Next Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Next
            </button>

            <!-- Page Number Input -->
            <div class="flex items-center ml-4">
              <label for="pageInput" class="mr-2">Go to:</label>
              <input
                id="pageInput"
                type="number"
                v-model.number="pageInput"
                @keyup.enter="jumpToPage"
                min="1"
                :max="totalPages"
                class="w-16 px-2 py-1 text-center border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>
