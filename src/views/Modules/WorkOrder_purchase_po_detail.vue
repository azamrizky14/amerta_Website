<script setup lang="ts">
import jsPDF from "jspdf";
import "jspdf-autotable";
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
import {
  po_GetPrefixByDate,
  po_CreatePO,
  item_getAllItemWithStatus,
  po_getDataById,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";

const route = useRoute();

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();

interface Option {
  id: number;
  name: string;
}

const options: Option[] = [
  { id: 1, name: "Option 1" },
  { id: 2, name: "Option 2" },
  { id: 3, name: "Option 3" },
  { id: 4, name: "Option 4" },
  { id: 5, name: "Option 5" },
];

const pageTitle = ref("Detail Purchase Order");
const pageList = ref(["Work Order", "Purchase", "Purchase Order", "Detail"]);

// Saved Data
const savedData = ref({
  Tr_po_id: "",
  Tr_po_supplier: "",
  Tr_po_status: "open",
  Tr_po_keterangan: "",
  Tr_po_item: [],

  Tr_po_user_created: indexStore.user.userName,
  Tr_po_created: "",
  Tr_po_tanggal: "",
  Tr_po_deleted: "N",
  Tr_po_domain: indexStore.user.companyName,
});

const materialData = ref<Row[]>([]);

const itemList = ref([]);

onMounted(async () => {
  const oldData = await po_getDataById(route.params.id);
  savedData.value = oldData;
  // console.log("data nya: ", oldData);
  materialData.value = savedData.value.Tr_po_item;
  const data = await item_getAllItemWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  // savedData.value.Tr_po_created = date;
});

// Fungsi untuk mengunduh PDF
const downloadPDF = () => {
  if (!savedData.value) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Tambahkan Logo
  const logoUrl =
    "https://media.licdn.com/dms/image/v2/D4D0BAQHc2nCQIrQWow/company-logo_200_200/company-logo_200_200/0/1706151527607?e=2147483647&v=beta&t=W4yMuupaQ8ju8e1k7gpxlaJln0Dhh9eE59LKMhCbau8";

  doc.addImage(logoUrl, "JPEG", 15, 10, 20, 20);

  // Judul Header
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("AMERTA ASA MEDIA", 40, 15);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Gg. Iddris rt.01 rw 07 kel. purwosari kec. purwosari kab. pasuruan",
    40,
    21.5
  );
  doc.text("amertaasamedia@gmail.com", 40, 26.5);

  // Header Purchase Order
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE ORDER", 282.5, 15, { align: "right" });

  // Data PO dalam bentuk tabel dengan dua kolom terpisah
  const poTableData = [
    ["PO Date", savedData.value.Tr_po_tanggal],
    ["PO Number", savedData.value.Tr_po_id],
  ];

  doc.autoTable({
    startY: 17.5, // Sesuaikan posisi agar tetap di atas
    margin: { left: 212.5 }, // Geser ke pojok kanan
    tableWidth: 70, // Lebar tabel
    body: poTableData,
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0], // Warna border hitam
      // lineWidth: 0.5, // Ketebalan border
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: "bold" }, // Kolom judul lebih kecil & bold
      1: { cellWidth: 40, halign: "right" }, // Kolom value lebih besar
    },
    theme: "grid",
  });
  const startY = 40; // Posisi awal tabel

  // **🏠 Buat Tabel Alamat**
  doc.autoTable({
    startY: startY,
    margin: { left: 182.5 },
    tableWidth: 100,
    body: [
      [
        "Gg. Iddris rt.01 rw 07 kel. purwosari kec. purwosari aljksfnak asjkfbakh askjfban hjk",
      ],
    ],
    styles: {
      cellPadding: 2,
      fontSize: 12,
      lineColor: [0, 0, 0], // Border hitam
    },
    theme: "grid",
  });

  // **Ambil tinggi tabel alamat**
  const addressHeight = doc.lastAutoTable.finalY - startY;

  // **🏢 Buat Tabel Vendor dengan tinggi yang sama**
  doc.setFontSize(10);
  doc.text("Vendor :", 15, 45);

  doc.autoTable({
    startY: startY,
    margin: { left: 35 },
    tableWidth: 100,
    body: [[savedData.value.Tr_po_supplier]],
    styles: {
      cellPadding: 2,
      fontSize: 12,
      lineColor: [0, 0, 0], // Border hitam
      fontStyle: "bold",
    },
    theme: "grid",
    didParseCell: (data) => {
      if (data.row.index === 0) {
        data.cell.styles.minCellHeight = addressHeight; // Atur tinggi baris
      }
    },
  });

  // Tabel Data Item
  const columns = [
    "Item",
    "Description",
    "More Info",
    "Qty",
    "Unit Price",
    "Disc (%)",
    "Tax (%)",
    "Amount",
  ];
  const rows = savedData.value.Tr_po_item.map((item) => [
    item.item_id,
    item.item_nama,
    "", // Kosongkan kolom More Info agar tidak muncul teks bawaan
    item.item_jumlah,
    `Rp ${item.item_harga.toLocaleString()}`,
    item.item_disc ? item.item_disc : "-",
    item.item_tax ? item.item_tax : "-",
    `Rp ${item.item_total.toLocaleString()}`,
  ]);

  rows.push(["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""]);

  // Ambil tinggi tabel alamat
  const dataTableStyle = {
    0: { cellWidth: 25 },
    1: { halign: "left" },
    2: { cellWidth: 25, fontStyle: "bold", textColor: [0, 0, 255] },
    3: { cellWidth: 20 },
    4: { cellWidth: 27.5, halign: "right" },
    5: { cellWidth: 20 },
    6: { cellWidth: 20 },
    7: { cellWidth: 37.5, halign: "right" },
  };

  const addressTableHeight = doc.lastAutoTable.finalY;
  const pageHeight = doc.internal.pageSize.height;

  // --- 1. Gambar tabel pertama ---
  doc.autoTable({
    startY: addressTableHeight + 5,
    head: [columns],
    body: rows.slice(0, rows.length - 2), // Sisakan 1 row terakhir
    theme: "grid",
    styles: {
      fontSize: 10,
      halign: "center",
    },
    columnStyles: dataTableStyle,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    didDrawCell: (data) => {
      if (
        data.section === "body" &&
        data.column.index === 2 &&
        data.row.index < rows.length - 2
      ) {
        const link = savedData.value.Tr_po_item[data.row.index].item_keterangan;
        if (link) {
          doc.textWithLink(
            "URL",
            data.cell.x + data.cell.width / 2 - 3,
            data.cell.y + data.cell.height / 2 + 1,
            { url: link }
          );
        }
      }
    },
  });

  // Ambil posisi terakhir tabel
  let lastY = doc.lastAutoTable.finalY;
  let remainingHeight = pageHeight - lastY - 63.34166666666665;

  // **Cek apakah remainingHeight negatif (meluap ke halaman baru)**
  if (remainingHeight < 0) {
    doc.addPage(); // Tambahkan halaman baru
    lastY = 10; // Reset posisi awal di halaman baru
    remainingHeight = pageHeight - lastY - 10; // Hitung ulang tinggi sisa di halaman baru
  }

  // --- 2. Tambahkan row ke-4 dengan tinggi dinamis ---
  doc.autoTable({
    startY: lastY,
    body: [rows[rows.length - 2]], // Baris ke-4
    theme: "grid",
    styles: {
      fontSize: 10,
      halign: "center",
      minCellHeight: remainingHeight >= 0 ? remainingHeight : "", // Terapkan tinggi sisa halaman
    },
    columnStyles: dataTableStyle,
  });

  const autoTableHeight = doc.lastAutoTable.finalY;

  // **🏠 Buat Tabel Deskripsi**
  doc.autoTable({
    startY: autoTableHeight,
    tableWidth: 143.75,
    body: [
      ["Description :"],
      [
        "Gg. Iddris rt.01 rw 07 kel. purwosari kec. purwosari aljksfnak asjkfbakh askjfban hjk jhasiujhnajfhafbafsk kasnfakbfhakskbf aksfjakf",
      ],
    ],
    styles: {
      cellPadding: 2,
    },
    theme: "grid",
  });

  // set total table

  // Total Order
  const totalOrder = savedData.value.Tr_po_item.reduce(
    (sum, item) => sum + item.item_total,
    0
  );

  // Total Discount
  const totalDiscount = savedData.value.Tr_po_item.reduce(
    (sum, item) => sum + item.item_total * (item.item_disc ? item.item_disc / 100 : 0),
    0
  );

  const totalTax = savedData.value.Tr_po_item.reduce(
    (sum, item) =>
      sum +
      item.item_total *
        (1 - (item.item_disc ? item.item_disc / 100 : 0)) *
        (item.item_tax ? item.item_tax / 100 : 0),
    0
  );

  const totalColumn = [
    ["Sub Total", `Rp ${totalOrder.toLocaleString()}`],
    ["Discount", `Rp ${totalDiscount.toLocaleString()}`],
    ["Tax", `Rp ${totalTax.toLocaleString()}`],
    ["Shipping", "Rp 0"],
    ["Insurance", "Rp 0"],
    ["Total Order", `Rp ${(totalOrder - totalDiscount + totalTax).toLocaleString()}`],
  ];

  // **🏠 Buat Tabel Total**
  doc.autoTable({
    startY: autoTableHeight,
    margin: { left: 205.4 }, // Geser ke pojok kanan
    body: totalColumn,
    styles: {
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold" }, // Kolom judul lebih kecil & bold
      1: { cellWidth: 37.5, halign: "right" }, // Kolom value lebih besar
    },
    theme: "grid",
  });

  // Ambil posisi akhir dari tabel total harga
  const totalTableY = doc.lastAutoTable.finalY; // Titik bawah tabel total harga

  // Posisi tanda tangan sejajar dengan total harga
  const leftX = 15; // Posisi kiri untuk "Prepared By"
  const rightX = 105; // Posisi kanan untuk "Approved By"

  // Tambahkan teks label tanda tangan
  const lineY = totalTableY - 15; // Geser sedikit ke bawah agar rapi
  doc.setFontSize(10);
  doc.text("Prepared By :", leftX, lineY);
  doc.text("Approved By :", rightX, lineY);

  // Tambahkan garis untuk tanda tangan
  doc.line(leftX, totalTableY, leftX + 50, totalTableY); // Garis kiri (Prepared By)
  doc.line(rightX, totalTableY, rightX + 50, totalTableY); // Garis kanan (Approved By)

  // Download PDF
  doc.save(`${savedData.value.Tr_po_id}.pdf`);
};

const formatNumber = (value) => {
  const data = value.toLocaleString("id-ID"); // Gunakan "id-ID" untuk format Indonesia
  return data;
};

const cancelAdd = async () => {
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "anda yakin membatalkan tambah data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
  });

  if (result.isConfirmed) {
    await router.push("/modules/work-order/purchase/po");
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "Tr_po_tanggal", label: "Tgl. Dibutuhkan" },
  // { key: "Tr_po_item", label: "List Item" },
]);

const dataError = ref([]); // Array untuk menyimpan error

const submitData = async () => {
  // console.log(savedData.value);
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  // Jika ada error, tampilkan di halaman dan hentikan submit
  if (dataError.value.length > 0) {
    return; // Jangan lanjutkan jika ada error
  }

  // Jika tidak ada error, lanjutkan dengan SweetAlert konfirmasi
  const result = await Swal.fire({
    title: "Tambah Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Tambah!",
    cancelButtonText: "Batal",
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const fixData = { ...savedData.value };
      fixData.Tr_po_item = materialData.value.filter(
        (x) =>
          x.item_id !== null &&
          x.item_id !== "" &&
          x.item_id !== undefined &&
          x.item_nama !== null &&
          x.item_nama !== "" &&
          x.item_nama !== undefined
      );
      const prefix = await po_GetPrefixByDate(fixData.Tr_po_created);
      fixData.Tr_po_id = prefix.nextId;

      await po_CreatePO(fixData);
      await successCreate().then(() => {
        router.push("/modules/work-order/purchase/po");
      });
    } catch (error) {
      await failedCreate(error);
    }
  }
};

// code excel

interface Row {
  item_id: string;
  item_nama: string;
  item_satuan: string;
  item_merk: string;
  item_jumlah: number;
  item_harga: number;
  item_total: number;
}

// Fungsi untuk menghitung harga total
const calculateTotal = (row: Row) => {
  row.item_total = row.item_jumlah * row.item_harga;
};
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <!-- ====== Form Elements Section Start -->

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Detail Data">
          <button
            @click="downloadPDF"
            class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Download PDF
          </button>
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id PO
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan Nama Supplier"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_id"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Status PO
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan Nama Supplier"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_status"
                />
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <div class="">
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Dibuat Oleh
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan Nama Supplier"
                  class="w-full mb-2 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_user_created"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Data Tambahan">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibuat
                </label>
                <input
                  type="date"
                  disabled
                  placeholder="Masukan Nama Supplier"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_created"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Dibutuhkan
                </label>
                <input
                  type="date"
                  disabled
                  placeholder="Masukan Nama Supplier"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_tanggal"
                />
              </div>
            </div>
            <div>
              <label
                class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
              >
                Keterangan
              </label>
              <textarea
                rows="1"
                disabled
                placeholder="Masukan keterangan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_po_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <DefaultCard cardTitle="List Item" class="col-span-2"
        ><div class="overflow-auto" style="max-height: 300px">
          <!-- Tabel -->
          <div
            class="grid gap-0 grid-cols-[35px_100px_140px_75px_100px_auto_75px_100px_110px]"
          >
            <!-- Header -->
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              No.
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              ID Item
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              Nama Item
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              Satuan
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              Merk
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              Keterangan
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              Jumlah
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              Harga
            </div>
            <div
              class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10"
            >
              Harga Total
            </div>

            <!-- Rows -->
            <template v-for="(row, index) in materialData" :key="index">
              <!-- No. -->
              <div class="px-1 py-0 text-center border border-gray-300">
                {{ index + 1 }}
              </div>
              <!-- ID Item -->
              <div class="p-0 border border-gray-300">
                <input
                  disabled
                  type="text"
                  v-model="row.item_id"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <!-- Nama Item -->
              <div class="p-0 border border-gray-300">
                <input
                  disabled
                  type="text"
                  v-model="row.item_nama"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <!-- Satuan -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  disabled
                  type="text"
                  v-model="row.item_satuan"
                  class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <!-- Merk -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  disabled
                  type="text"
                  v-model="row.item_merk"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <!-- Merk -->
              <div class="px-1 py-0 border border-gray-300">
                <input
                  disabled
                  type="text"
                  v-model="row.item_keterangan"
                  class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <!-- Jumlah -->
              <div class="px-1 py-0 pr-0 border border-gray-300">
                <input
                  disabled
                  type="number"
                  v-model="row.item_jumlah"
                  @input="calculateTotal(row)"
                  class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <!-- Harga Satuan -->
              <div class="px-1 py-0 pr-0 border border-gray-300">
                <input
                  disabled
                  type="number"
                  v-model="row.item_harga"
                  @input="calculateTotal(row)"
                  class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <!-- Harga Total -->
              <div class="w-full px-2 py-0 text-xs border border-gray-300">
                <div class="h-full flex items-center justify-end">
                  {{ formatNumber(row.item_total) }}
                </div>
              </div>
            </template>
          </div>
        </div>
      </DefaultCard>

      <div class="flex flex-col gap-9 col-span-2">
        <!-- Input Fields Start -->
        <DefaultCard>
          <div v-if="dataError.length > 0" class="mt-4 mb-4">
            <ul>
              <li v-for="(error, index) in dataError" :key="index" class="ml-5 text-red">
                <b>- {{ error }}</b>
              </li>
            </ul>
          </div>
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <router-link
              to="/modules/work-order/purchase/po"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90 col-span-2"
            >
              Kembali
            </router-link>
            <button
              @click="cancelAdd"
              class="hidden flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="submitData"
              class="hidden flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Tambah Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>

    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>

<style>
.vs__search {
  padding: 0 !important;
}
</style>
