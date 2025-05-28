<script setup lang="ts">
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ImageUploadQA from "@/components/Forms/Image/ImageUploadQA.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import {
  qa_GetPrefixByDate,
  po_updateDataByPO,
  qa_CreateQA,
  lokasi_getAllLocationWithStatus,
  gr_GetTrGrListForQa,
  stock_CreateSh,
  gr_updateGRbyGR,
  uploadImage,
  moveMultiTempImage,
  removeMultiTempImage,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";

import { ref, onMounted } from "vue";
import router from "@/router";
import { mdiCamera } from "@mdi/js";

const indexStore = useIndexStore();

const pageTitle = ref("Tambah Quality Assurance");
const pageList = ref(["Work Order", "Purchase", "Quality Assurance", "Tambah"]);

// Saved Data
const savedData = ref({
  Tr_po_id: "",
  Tr_po_status: "open",
  Tr_po_keterangan: "",
  Tr_po_lokasi: "",
  Tr_po_item: [],

  Tr_po_created: "",
  Tr_po_tanggal: "",
  Tr_po_deleted: "N",
  Tr_qa_inspection_date: "",
  Tr_qa_user_created: indexStore.user.userName,
  companyName: indexStore.user.companyName,
  companyCode: indexStore.company.companyCode,
});

const items = ref<Row[]>([]);
const itemsKabel = ref<Row[]>([]);
const itemsModem = ref<Row[]>([]);
const itemsTiang = ref<Row[]>([]);

const lokasiList = ref([]);
const grList = ref([]);

onMounted(async () => {
  const dataGr = await gr_GetTrGrListForQa(
    indexStore.user.companyCode,
    indexStore.user.hierarchyCode,
    "N",
    ""
  );
  grList.value = dataGr;

  const dataLokasi = await lokasi_getAllLocationWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  lokasiList.value = dataLokasi;

  const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  savedData.value.Tr_po_created = date;
});

const filterSelectedGr = (value) => {
  if (value === null || value === undefined) {
    savedData.value = {
      Tr_qa_user_created: indexStore.user.userName,
      companyName: indexStore.user.companyName,
      companyCode: indexStore.company.companyCode,
      Tr_qa_lokasi: "",
      Tr_qa_inspection_date: "",
    };
  } else if (value && value.Tr_gr_item) {
    // Pertama, buat map item_id => item_jumlah_qa dari Tr_pp_item
    const ppItemMap = {};
    if (value.Tr_pp_item) {
      value.Tr_pp_item.forEach((ppItem) => {
        ppItemMap[ppItem.item_id] = ppItem.item_jumlah_qa;
      });
    }

    // Kemudian buat itemList seperti biasa
    const itemList = value.Tr_gr_item.map((x) => ({
      ...x,
      item_jumlah: ppItemMap[x.item_id] ?? x.item_jumlah, // pakai item_jumlah_qa kalau ada
      item_jumlah_lolos: 0,
      item_jumlah_rusak: 0,
      item_jumlah_retur: 0,
      item_status: "intangible",
    }));

    items.value = itemList.filter(
      (x) => x.item_tipe === "Material" || x.item_tipe === "Aset"
    );

    itemsModem.value = itemList.filter((x) => x.item_tipe === "Modem");
    itemsModem.value.forEach((item) => {
      item.item_properties = Array.from({ length: item.item_jumlah }, (_, index) => ({
        item_properties_id: "",
        item_properties_status: "lolos",
      }));
    });

    itemsKabel.value = itemList.filter((x) => x.item_tipe === "Kabel");
    itemsKabel.value.forEach((item) => {
      item.item_properties = Array.from({ length: item.item_jumlah }, (_, index) => ({
        item_properties_id: "",
        item_properties_status: "lolos",
        item_properties_qty: 0,
      }));
    });

    itemsTiang.value = itemList.filter((x) => x.item_tipe === "Tiang");
    itemsTiang.value.forEach((item) => {
      item.item_properties = Array.from({ length: item.item_jumlah }, (_, index) => ({
        item_properties_id: "",
        item_properties_status: "lolos",
        item_properties_qty: 0,
      }));
    });
  }
};

const filterStockHistory = (data) => {
  const reducedItems = [];

  data.forEach((item) => {
    const {
      item_id,
      item_nama,
      item_jenis,
      item_tipe,
      item_satuan,
      item_keterangan,
      item_status,
      item_jumlah_lolos,
      item_properties,
    } = item;

    const base = {
      item_id,
      item_nama,
      item_jenis,
      item_tipe,
      item_satuan,
      item_keterangan,
      item_status,
    };

    // Jika tidak ada properties
    if (!Array.isArray(item_properties) || item_properties.length === 0) {
      reducedItems.push({
        ...base,
        item_jumlah: item_jumlah_lolos,
        Sh_status: "lolos",
      });
      return;
    }

    // Utility function untuk hapus item_properties_status
    const cleanProps = (props) =>
      props.map(({ item_properties_status, ...rest }) => rest);

    // Proses yang lolos
    const lolosProps = item_properties.filter(
      (p) => p.item_properties_status === "lolos"
    );
    if (lolosProps.length) {
      reducedItems.push({
        ...base,
        item_jumlah: lolosProps.length,
        item_properties: cleanProps(lolosProps),
        Sh_status: "lolos",
      });
    }

    // Proses yang rusak
    const rusakProps = item_properties.filter(
      (p) => p.item_properties_status === "rusak"
    );
    if (rusakProps.length) {
      reducedItems.push({
        ...base,
        item_jumlah: rusakProps.length,
        item_properties: cleanProps(rusakProps),
        Sh_status: "rusak",
      });
    }

    // Tambah filter lain jika perlu (misal retur)
  });

  return reducedItems;
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
    await router.push("/modules/work-order/purchase/qa");
  }
};

// Array validator untuk field wajib
const dataValidator = ref([
  { key: "Tr_po_id", label: "Id PO" },
  { key: "Tr_qa_inspection_date", label: "Tgl. Inspeksi" },
  { key: "Tr_qa_lokasi", label: "Lokasi Tujuan" },
  // { key: "Tr_po_item", label: "List Item" },
]);

const dataError = ref([]); // Array untuk menyimpan error

const submitData = async () => {
  // Clear previous errors
  dataError.value.splice(0, dataError.value.length);

  // Validasi field wajib dari data utama
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key] || savedData.value[validator.key].length === 0) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  if (
    items.value.some((item) => qtySisa(item) !== item.item_jumlah && !item.item_image)
  ) {
    dataError.value.push(`Ada data di material & aset yang foto buktinya kosong!`);
  }

  if (
    itemsModem.value.some((item) =>
      item.item_properties?.some(
        (prop) => prop.item_properties_id !== "" && !prop.item_properties_image
      )
    )
  ) {
    dataError.value.push("Ada data modem yang foto buktinya kosong!");
  }
  if (
    itemsKabel.value.some((item) =>
      item.item_properties?.some(
        (prop) => prop.item_properties_id !== "" && prop.item_properties_qty < 1
      )
    )
  ) {
    dataError.value.push("Ada data kabel yang jumlahnya kosong!");
  }
  if (
    itemsKabel.value.some((item) =>
      item.item_properties?.some(
        (prop) => prop.item_properties_id !== "" && !prop.item_properties_image
      )
    )
  ) {
    dataError.value.push("Ada data kabel yang foto buktinya kosong!");
  }
  if (
    itemsTiang.value.some((item) =>
      item.item_properties?.some(
        (prop) => prop.item_properties_id !== "" && !prop.item_properties_image
      )
    )
  ) {
    dataError.value.push("Ada data tiang yang foto buktinya kosong!");
  }

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
    let uploadedTempFiles;
    try {
      showLoading();

      const fixData = { ...savedData.value };
      const dateToday = await getDateToday("yyyy-MM-dd");
      const QAprefix = await qa_GetPrefixByDate(dateToday);
      const qaData = {
        Tr_qa_id: QAprefix.nextId,
        Tr_gr_id: fixData.Tr_gr_id,
        Tr_po_id: fixData.Tr_po_id,
        Tr_qa_created_date: dateToday,
        Tr_qa_inspection_date: fixData.Tr_qa_inspection_date,
        Tr_qa_lokasi: fixData.Tr_qa_lokasi,
        Tr_qa_user_inspection: indexStore.user.userName,
        Tr_qa_user_created: indexStore.user.userName,
        Tr_qa_keterangan: fixData.Tr_qa_keterangan ? fixData.Tr_qa_keterangan : "",
        Tr_qa_item: [...items.value],
        companyName: indexStore.user.companyName,
        companyCode: indexStore.user.companyCode,
        Tr_qa_deleted: "N",
      };

      itemsModem.value.forEach((data) => {
        qaData.Tr_qa_item.push(data);
      });
      itemsKabel.value.forEach((data) => {
        qaData.Tr_qa_item.push(data);
      });
      itemsTiang.value.forEach((data) => {
        qaData.Tr_qa_item.push(data);
      });

      // console.log("data before", qaData);
      qaData.Tr_qa_item = qaData.Tr_qa_item.map((item) => {
        // Destructuring semua data, lalu override item_jumlah dan exclude item_jumlah_datang
        const { item_jumlah_datang, ...rest } = item;
        // Filter item_properties tetap diubah
        let item_properties = item.item_properties || [];
        item_properties = item_properties.filter((x) => x.item_properties_id !== "");
        if (
          item.item_tipe !== "Aset" &&
          item.item_tipe !== "material" &&
          Array.isArray(item.item_properties)
        ) {
          const lolos = item_properties.filter(
            (p) => p.item_properties_status === "lolos"
          ).length;
          const rusak = item_properties.filter(
            (p) => p.item_properties_status === "rusak"
          ).length;
          const retur = item_properties.filter(
            (p) => p.item_properties_status === "retur"
          ).length;

          return {
            ...rest,
            item_properties, // <<< tambahkan ini
            item_jumlah: item_jumlah_datang,
            item_jumlah_lolos: lolos,
            item_jumlah_rusak: rusak,
            item_jumlah_retur: retur,
          };
        } else {
          return {
            ...rest,
            item_properties, // <<< tambahkan ini
            item_jumlah: item_jumlah_datang,
          };
        }
      });

      qaData.Tr_qa_item = qaData.Tr_qa_item.filter(
        (x) =>
          x.item_jumlah > 0 &&
          (x.item_jumlah_lolos > 0 || x.item_jumlah_retur > 0 || x.item_jumlah_rusak > 0)
      );

      uploadedTempFiles = await uploadFilesInQAData(qaData);

      await qa_CreateQA(qaData);
      await moveMultiTempImage(uploadedTempFiles);
      // Update PO
      let filterPO = {};

      filterPO.Tr_pp_item = fixData.Tr_pp_item.map((ppItem) => {
        const matchQa = qaData.Tr_qa_item.find(
          (qaItem) => qaItem.item_id === ppItem.item_id
        );

        if (matchQa) {
          const jumlahLolos = matchQa.item_jumlah_lolos || 0;
          const jumlahRusak = matchQa.item_jumlah_rusak || 0;
          const jumlahRetur = matchQa.item_jumlah_retur || 0;

          // Update qty
          ppItem.item_jumlah_qa = Math.max(
            (ppItem.item_jumlah_qa || 0) - (jumlahLolos + jumlahRusak),
            0
          );
          ppItem.item_jumlah_gr = (ppItem.item_jumlah_gr || 0) + jumlahRetur;
        }

        return ppItem;
      });

      if (
        filterPO.Tr_pp_item.every(
          (item) => item.item_jumlah_qa === 0 && item.item_jumlah_gr === 0
        )
      )
        filterPO.Tr_po_status = "complete";

      // Create Stock History
      const dataSh = filterStockHistory(qaData.Tr_qa_item).map((x) => {
        return {
          Sh_item_id: x.item_id,
          Sh_item_nama: x.item_nama,
          Sh_item_tipe: x.item_tipe,
          Sh_item_jenis: x.item_jenis,
          Sh_item_qty: x.item_jumlah,
          Sh_item_satuan: x.item_satuan,
          Sh_item_properties: x.item_properties ? x.item_properties : [],
          Sh_item_status: x.item_status,
          Sh_source_id: qaData.Tr_qa_id,
          Sh_created_date: dateToday,
          Sh_user_created: indexStore.user.userName,
          Sh_location_to: x.Sh_status === "rusak" ? "Gudang Sampah" : qaData.Tr_qa_lokasi,

          Sh_location_from: "External",
          Sh_type: x.Sh_status === "rusak" ? "out" : "in",
          Sh_source: "QA",
          Sh_keterangan: "",
          companyName: indexStore.user.companyName,
          companyCode: indexStore.user.companyCode,
          Sh_deleted: "N",
        };
      });

      const allQaZero = filterPO.Tr_pp_item.every((item) => item.item_jumlah_qa === 0);

      if (allQaZero) {
        await gr_updateGRbyGR({ Tr_gr_qa_status: "done" }, qaData.Tr_gr_id);
      } else {
        await gr_updateGRbyGR({ Tr_gr_qa_status: "partial" }, qaData.Tr_gr_id);
      }

      await po_updateDataByPO(qaData.Tr_po_id, filterPO);
      await stock_CreateSh(dataSh);
      await successCreate().then(() => {
        router.push("/modules/work-order/purchase/qa");
      });
    } catch (error) {
      if (uploadedTempFiles) {
        await removeMultiTempImage(uploadedTempFiles);
      }
      await failedCreate(error);
    }
  }
};

const uploadFilesInQAData = async (qaData) => {
  let uploadedFiles = [];

  if (qaData.Tr_qa_item && qaData.Tr_qa_item.length > 0) {
    for (const item of qaData.Tr_qa_item) {
      // Upload item_image jika ada file
      if (item.item_image && item.item_image instanceof File) {
        const filename = await uploadImage(item.item_image, "QUALITY-INSPECTION");
        item.item_image = filename; // Menyimpan nama file ke qaData
        uploadedFiles.push(filename);
      }

      // Upload item_properties_image jika ada file
      if (item.item_properties && item.item_properties.length > 0) {
        for (const prop of item.item_properties) {
          if (prop.item_properties_image && prop.item_properties_image instanceof File) {
            const filename = await uploadImage(
              prop.item_properties_image,
              "QUALITY-INSPECTION"
            );
            prop.item_properties_image = filename; // Menyimpan nama file ke item properties
            uploadedFiles.push(filename);
          }
        }
      }
    }
  }

  uploadedFiles = uploadedFiles.map((x) => ({
    filename: x,
    finalLocation: "wo_purchasing",
  }));

  return uploadedFiles; // Mengembalikan daftar file yang berhasil diupload
};

// code excel

interface Row {
  item_id: string;
  item_nama: string;
  item_satuan: string;
  item_jenis: string;
  item_jumlah: number;
  item_harga: number;
  item_total: number;
}

const qtySisa = (value) => {
  if (value) {
    return (
      value.item_jumlah -
      (value.item_jumlah_lolos + value.item_jumlah_rusak + value.item_jumlah_retur)
    );
  }
};
// Fungsi untuk menghitung harga total
const calculateSisa = (index, value, source) => {
  // Validasi qtyKeluar tidak boleh kurang dari 1
  const qtyMinus = items.value[index][source] < 0;
  if (qtySisa(value) < 0 || qtyMinus) {
    Swal.fire({
      title: "Error!",
      text: qtyMinus
        ? "Jumlah input tidak boleh dibawah 0!"
        : "Jumlah input melebihi jumlah yang tersedia!",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      items.value[index][source] = 0;
    });
  }
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
        <DefaultCard cardTitle="Input Data" class="pb-3">
          <div class="flex flex-col gap-2 p-6.5 mb-1">
            <div class="flex flex-col gap-3">
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Good Receipt
                </label>

                <v-select
                  v-model="savedData"
                  :options="grList"
                  :clearable="false"
                  label="Tr_gr_id"
                  placeholder="Masukan Tujuan PO"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                  @update:modelValue="(value) => filterSelectedGr(value)"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ savedData.Tr_gr_id }}</span>
                  </template>
                </v-select>
              </div>
            </div>
            <div class="flex flex-col gap-2 xl:flex-row">
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tgl. Inspeksi
                </label>

                <input
                  type="date"
                  placeholder="Tgl Dibutuhkan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_qa_inspection_date"
                />
              </div>
              <div class="lg:w-2/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Lokasi Tujuan
                </label>

                <v-select
                  v-model="savedData.Tr_qa_lokasi"
                  :options="lokasiList"
                  :reduce="(item) => item.lokasi_nama"
                  label="lokasi_nama"
                  placeholder="Masukan Tujuan PO"
                  class="w-full rounded-lg bg-transparent custom-v-select font-normal outline-none transition disabled:cursor-default disabled:bg-whiter"
                >
                  <template #selected-option>
                    <span class="dark:text-white">{{ savedData.Tr_qa_lokasi }}</span>
                  </template>
                </v-select>
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
            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Catatan
              </label>
              <textarea
                rows="5"
                placeholder="Masukan Catatan disini!"
                class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                v-model="savedData.Tr_qa_keterangan"
              ></textarea>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <!-- Item Material & Aset -->
      <div class="col-span-2" v-if="items.length > 0">
        <DefaultCard cardTitle="List Material & Aset">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_80px_80px_80px_80px_80px_30px]"
            >
              <!-- Header -->
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="row-span-2 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="col-span-5 p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Kuantitas (Jumlah)
              </div>
              <div
                class="p-1 row-span-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                <svg
                  class="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path :d="mdiCamera" />
                </svg>
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Tersedia
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Sisa
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Lolos
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Rusak
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Retur
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in items" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>

                <!-- Nama -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <select
                    v-model="row.item_status"
                    class="px-2 py-0.5 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- Qty Datang -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    disabled
                    type="number"
                    v-model="row.item_jumlah"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Sisa -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    disabled
                    type="number"
                    :value="qtySisa(row)"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Lolos -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_lolos"
                    @input="calculateSisa(index, row, 'item_jumlah_lolos')"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Rusak -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_rusak"
                    @input="calculateSisa(index, row, 'item_jumlah_rusak')"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Qty Retur -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    type="number"
                    v-model="row.item_jumlah_retur"
                    @input="calculateSisa(index, row, 'item_jumlah_retur')"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <div
                  class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                >
                  <ImageUploadQA v-model="row.item_image" :index="'Item' + index" />
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Modem -->
      <div class="col-span-2" v-if="itemsModem.length > 0">
        <DefaultCard cardTitle="List Modem">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_425px]">
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Serial Number (SN)
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsModem" :key="index">
                <!-- No. -->
                <div
                  class="px-1 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Nama -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <select
                    v-model="row.item_status"
                    class="px-2 py-0.5 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_79px_135px_auto_30px]">
                    <template v-for="(props, i) in row.item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                      >
                        {{ i + 1 }}
                      </div>
                      <!-- Jenis -->
                      <div class="px-0.5 py-0 border border-gray-300">
                        <select
                          v-model="props.item_properties_status"
                          class="px-2 py-0.5 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="lolos">Lolos</option>
                          <option value="rusak">Rusak</option>
                          <option value="retur">Retur</option>
                        </select>
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          type="text"
                          placeholder="Serial Number (SN)"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                      >
                        <ImageUploadQA
                          v-model="props.item_properties_image"
                          :index="'Modem' + i"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Tiang -->
      <div class="col-span-2" v-if="itemsTiang.length > 0">
        <DefaultCard cardTitle="List Tiang">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_425px]">
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Kode Tiang
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsTiang" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Nama -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <select
                    v-model="row.item_status"
                    class="px-2 py-0.5 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_79px_135px_auto_30px]">
                    <template v-for="(props, i) in row.item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                      >
                        {{ i + 1 }}
                      </div>
                      <!-- Jenis -->
                      <div class="px-0.5 py-0 border border-gray-300">
                        <select
                          v-model="props.item_properties_status"
                          class="px-2 py-0.5 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="lolos">Lolos</option>
                          <option value="rusak">Rusak</option>
                          <option value="retur">Retur</option>
                        </select>
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          type="text"
                          placeholder="Kode Tiang"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-1 py-0 border border-gray-300 text-sm">
                        <input
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                      >
                        <ImageUploadQA
                          v-model="props.item_properties_image"
                          :index="'Tiang' + i"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Item Kabel -->
      <div class="col-span-2" v-if="itemsKabel.length > 0">
        <DefaultCard cardTitle="List Kabel">
          <div class="overflow-auto" style="max-height: 600px">
            <!-- Tabel -->
            <div class="grid gap-0 grid-cols-[35px_80px_100px_70px_auto_107px_425px]">
              <!-- Header -->
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                No.
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                ID Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Nama Item
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Satuan
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Jenis
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                *Status
              </div>
              <div
                class="p-2 py-1 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark flex items-center justify-center"
              >
                Kode Kabel
              </div>

              <!-- Rows -->
              <template v-for="(row, index) in itemsKabel" :key="index">
                <!-- No. -->
                <div
                  class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                >
                  {{ index + 1 }}
                </div>
                <!-- Id Item -->
                <div
                  class="px-1 py-0 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>

                <!-- Nama -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-0 text-xs text-center text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div
                  class="px-1 border border-gray-300 flex justify-center items-start py-1"
                >
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <select
                    v-model="row.item_status"
                    class="px-2 py-0.5 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="tangible">Tangible</option>
                    <option value="intangible">Intangible</option>
                  </select>
                </div>
                <!-- SN -->
                <div class="py-0 pr-0 border border-gray-300">
                  <div class="grid gap-0 grid-cols-[35px_79px_100px_65px_auto_30px]">
                    <template v-for="(props, i) in row.item_properties" :key="index">
                      <div
                        class="px-1 py-0 text-center border border-gray-300 text-xs flex justify-center items-start py-1"
                      >
                        {{ i + 1 }}
                      </div>
                      <!-- Jenis -->
                      <div class="px-0.5 py-0 border border-gray-300">
                        <select
                          v-model="props.item_properties_status"
                          class="px-2 py-0.5 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="lolos">Lolos</option>
                          <option value="rusak">Rusak</option>
                          <option value="retur">Retur</option>
                        </select>
                      </div>
                      <div class="px-0.5 py-0 border border-gray-300 text-sm">
                        <input
                          type="text"
                          placeholder="Kode Kabel"
                          v-model="props.item_properties_id"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-0.5 py-0 border border-gray-300 text-sm">
                        <input
                          type="number"
                          v-model="props.item_properties_qty"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div class="px-0.5 py-0 border border-gray-300 text-sm">
                        <input
                          type="text"
                          placeholder="Catatan"
                          v-model="props.item_properties_note"
                          class="w-full px-1 py-0.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                        />
                      </div>
                      <div
                        class="relative py-0 border border-gray-300 text-sm flex items-center justify-center"
                      >
                        <ImageUploadQA
                          v-model="props.item_properties_image"
                          :index="'Kabel' + i"
                        />
                      </div>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
      </div>

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
            <button
              @click="cancelAdd"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
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
.vs__open-indicator path {
  @apply fill-current dark:text-white;
}
.vs__clear path {
  @apply fill-current dark:text-white;
}
.custom-v-select .vs__dropdown-toggle {
  padding: 0.3rem 1rem 0.45rem 1rem;
  @apply border border-gray-400 dark:border-white;
}
</style>
