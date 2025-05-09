<script setup lang="ts">
import jsPDF from "jspdf";
import "jspdf-autotable";
import "vue-select/dist/vue-select.css"; // Import CSS untuk vue-select
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ImagePreview from "@/components/Forms/Image/ImagePreview.vue";
import Swal from "sweetalert2";

import { getDateToday } from "@/stores/date";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
import {
  po_GetPrefixByDate,
  pp_updateDataWithImage,
  po_CreatePO,
  item_getAllItemWithStatus,
  pp_getDataById,
  pp_updateDataById,
  po_updateDataByPO,
} from "@/stores/functionAPI";
import { useIndexStore } from "@/stores";
import { useRoute } from "vue-router";

const route = useRoute();

import { ref, onMounted, computed } from "vue";
import router from "@/router";

const indexStore = useIndexStore();

interface Option {
  id: number;
  name: string;
}

const optionsPayment: Option[] = [
  { id: 1, name: "Cash" },
  { id: 2, name: "Bank" },
  { id: 3, name: "Utang" },
];

const imageUrl = "images/wo_purchasing";

const pageTitle = ref("Detail Payment");
const pageList = ref(["Work Order", "Purchase", "Payment", "Detail"]);

// Saved Data
const savedData = ref({
  Tr_po_id: "",
  Tr_po_supplier: "",
  Tr_po_status: "open",
  Tr_po_keterangan: "",
  Tr_po_item: [],
  Tr_pp_payment_detail: {},

  Tr_po_user_created: indexStore.user.userName,
  Tr_po_created: "",
  Tr_po_tanggal: "",
  Tr_po_deleted: "N",
  Tr_po_domain: indexStore.user.companyName,
});

const materialData = ref<Row[]>([]);

// Sub Total
const subTotal = computed(() => {
  const total = savedData.value.Tr_po_item.reduce(
    (sum, item) => sum + item.item_jumlah * item.item_harga,
    0
  );
  return total;
});

// Total Diskon
const totalDiscount = computed(() => {
  const total = savedData.value.Tr_po_item.reduce((sum, item) => {
    const discount = item.item_disc
      ? (item.item_jumlah * item.item_harga * item.item_disc) / 100
      : 0;
    return sum + discount;
  }, 0);
  return total;
});

// Total Pajak
const totalTax = computed(() => {
  const total = savedData.value.Tr_po_item.reduce((sum, item) => {
    const discountRate = item.item_disc ? item.item_disc / 100 : 0;
    const taxRate = item.item_tax ? item.item_tax / 100 : 0;

    const taxableAmount = item.item_jumlah * item.item_harga * (1 - discountRate);
    const taxAmount = taxableAmount * taxRate;

    return sum + taxAmount;
  }, 0);
  return total;
});

const alertPayment = async () => {
  // await getData();
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
              value="${savedData.value.Tr_pp_payment_detail.Tr_pp_payment_shipping}"
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
              value="${savedData.value.Tr_pp_payment_detail.Tr_pp_payment_insurance}"
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
                savedData.value.Tr_pp_payment_method === "" ? "selected" : ""
              }>Metode Pembayaran</option>
              ${optionsPayment
                .map(
                  (opt) =>
                    `<option value="${opt.name}" ${
                      savedData.value.Tr_pp_payment_method === opt.name ? "selected" : ""
                    }>${opt.name}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>
        <div class="w-1/2 text-sm pl-5">
          <p class="flex justify-between pb-1">
            <span>Sub Total : </span>
            <span>Rp. ${formatNumber(subTotal.value)}</span>
          <p>
          <p class="flex justify-between pb-1">
            <span>Discount : </span>
            <span>(Rp. ${formatNumber(totalDiscount.value)})</span>
          <p>
          <p class="flex justify-between pb-1">
            <span>Tax : </span>
            <span>Rp. ${formatNumber(totalTax.value)}</span>
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
              value="${savedData.value.Tr_pp_image}"
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
        const amount = subTotal.value - totalDiscount.value + totalTax.value;

        const data = shipping + insurance + amount;
        totalValue.textContent = formatNumber(data);
      }

      shippingValue.textContent = formatNumber(shippingInput.value);
      insuranceValue.textContent = formatNumber(insuranceInput.value);
      handleInputChange();
      // Menangkap perubahan input secara real-time

      shippingInput.addEventListener("input", (e) => {
        savedData.value.Tr_pp_payment_detail.Tr_pp_payment_shipping = e.target.value;
        shippingValue.textContent = formatNumber(e.target.value);
        handleInputChange();
      });

      insuranceInput.addEventListener("input", (e) => {
        savedData.value.Tr_pp_payment_detail.Tr_pp_payment_insurance = e.target.value;
        insuranceValue.textContent = formatNumber(e.target.value);
        handleInputChange();
      });

      paymentMethodInput.addEventListener("change", (e) => {
        savedData.value.Tr_pp_payment_method = e.target.value;
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

      savedData.value.Tr_pp_payment_method = paymentMethod;
      savedData.value.Tr_pp_image = image;

      return { ...savedData.value };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const fixedData = {
          Tr_pp_user_paid: indexStore.user.userName,
          Tr_pp_payment_date: await getDateToday("yyyy-MM-dd"),
          Tr_pp_payment_detail: savedData.value.Tr_pp_payment_detail,
          Tr_pp_payment_method: savedData.value.Tr_pp_payment_method,
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
        console.log(materialData);
        fixedData.Tr_pp_item = materialData.value.map((x) => ({
          ...x,
          item_jumlah_gr: x.item_jumlah,
          item_jumlah_qa: x.item_jumlah,
        }));
        fixedData.Tr_pp_shipment = {};
        fixedData.Tr_pp_payment_amount = Number(total);

        const formData = new FormData();
        formData.append("Tr_pp_image", savedData.value.Tr_pp_image);
        await pp_updateDataById(savedData.value._id, fixedData);
        await pp_updateDataWithImage(savedData.value.Tr_pp_id, formData);
        await po_updateDataByPO(savedData.value.Tr_po_id, {
          Tr_po_status: "process",
          Tr_po_shipment: {},
          Tr_pp_item: fixedData.Tr_pp_item,
        });
        await getData();
        Swal.fire("Sukses!", "Data telah disimpan.", "success");
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }
    }
  });
};

const alertShipment = async () => {
  let shipmentDetail = savedData.value.Tr_pp_shipment;
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
              disabled
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
              disabled
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
              disabled
            />
          </div>
        </div>
      </div>
    `,
    focusConfirm: false,
    cancelButtonText: "Kembali",
    showConfirmButton: false,
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
        await getData();
        Swal.fire("Sukses!", "Data telah disimpan.", "success");
      } catch (error) {
        Swal.fire("Gagal", error.message, "error");
      }
    }
  });
};

const alertCancel = async () => {
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

      await pp_updateDataById(savedData.value._id, fixedData);
      await po_updateDataByPO(savedData.value.Tr_po_id, { Tr_po_status: "cancel" });
      await getData();
      Swal.fire("Dibatalkan!", "Pesanan berhasil dibatalkan.", "success");
      // } catch (error) {
    } catch (error) {
      Swal.fire("Gagal", error.message, "error");
    }
  }
};

onMounted(async () => {
  await getData();
});

const getData = async () => {
  const oldData = await pp_getDataById(route.params.id);
  savedData.value = oldData;
  if (!savedData.value.Tr_pp_payment_detail.Tr_pp_payment_shipping)
    savedData.value.Tr_pp_payment_detail.Tr_pp_payment_shipping = 0;
  if (!savedData.value.Tr_pp_payment_detail.Tr_pp_payment_insurance)
    savedData.value.Tr_pp_payment_detail.Tr_pp_payment_insurance = 0;
  if (!savedData.value.Tr_pp_payment_method) savedData.value.Tr_pp_payment_method = "";
  // console.log("data nya: ", oldData);
  materialData.value =
    savedData.value.Tr_pp_status === "process"
      ? savedData.value.Tr_po_item
      : savedData.value.Tr_pp_item;
  const data = await item_getAllItemWithStatus(
    indexStore.company.companyCode,
    indexStore.user.hierarchyCode,
    "N"
  );
  // const date = await getDateToday("yyyy-MM-dd");
  // savedData.value.Tr_po_created = date;

  // savedData.value.Tr_po_created = date;
};

// Total Order
const totalOrder = () => {
  if (savedData.value.Tr_pp_payment_detail) {
    const data =
      savedData.value.Tr_pp_payment_detail.Tr_pp_payment_total -
      savedData.value.Tr_pp_payment_detail.Tr_pp_payment_discount +
      savedData.value.Tr_pp_payment_detail.Tr_pp_payment_tax;
    return formatNumber(data);
  }
};

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyDisc = (index, row) => {
  const data = savedData.value.Tr_po_item[index].item_disc;
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  if (data !== "" && (data < 0 || data > 100)) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah input harus antara 0 - 100",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      savedData.value.Tr_po_item[index].item_disc = 0;
    });
  }
  calculateTotal(row);
};

// Validasi qtyKeluar tidak boleh kurang dari 1
const validateQtyTax = (index, row) => {
  // Hanya lakukan validasi jika qtyKeluar tidak kosong
  const data = savedData.value.Tr_po_item[index].item_tax;
  if (data !== "" && (data < 0 || data > 100)) {
    Swal.fire({
      title: "Error!",
      text: "Jumlah input harus antara 0 - 100",
      icon: "error",
      position: "top-end",
      timer: 1000,
      showConfirmButton: false,
      toast: true,
    }).then(() => {
      // Setelah SweetAlert muncul, ganti nilai qtyKeluar menjadi 1
      savedData.value.Tr_po_item[index].item_tax = 0;
    });
  }
  calculateTotal(row);
};

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
    "https://media.licdn.com/dms/image/v2/D4D0BAQHc2nCQArQWow/company-logo_200_200/company-logo_200_200/0/1706151527607?e=2147483647&v=beta&t=W4yMuupaQ8ju8e1k7gpxlaJln0Dhh9eE59LKMhCbau8";

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

  // Header Payment
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE Payment", 282.5, 15, { align: "right" });

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
    body: [[savedData.value.Tr_po_lokasi]],
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
    item.item_nama + " - " + item.item_jenis,
    "", // Kosongkan kolom More Info agar tidak muncul teks bawaan
    item.item_jumlah,
    `Rp ${formatNumber(item.item_harga)}`,
    item.item_disc ? item.item_disc : "-",
    item.item_tax ? item.item_tax : "-",
    `Rp ${formatNumber(item.item_total)}`,
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
    body: [["Description :"], [savedData.value.Tr_po_keterangan]],
    styles: {
      cellPadding: 2,
    },
    theme: "grid",
  });

  // set total table

  const totalColumn = [
    [
      "Sub Total",
      `Rp ${formatNumber(savedData.value.Tr_pp_payment_detail.Tr_pp_payment_total)}`,
    ],
    [
      "Discount",
      `Rp ${formatNumber(savedData.value.Tr_pp_payment_detail.Tr_pp_payment_discount)}`,
    ],
    ["Tax", `Rp ${formatNumber(savedData.value.Tr_pp_payment_detail.Tr_pp_payment_tax)}`],
    ["Shipping", "Rp 0"],
    ["Insurance", "Rp 0"],
    ["Total Order", `Rp ${formatNumber(totalOrder())}`],
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
  const data = Number(value).toLocaleString("id-ID"); // Gunakan "id-ID" untuk format Indonesia
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
  item_jenis: string;
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
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Payment
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan Nama Supplier"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_pp_id"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Id Purchase Order
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan PO"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_po_id"
                />
              </div>
            </div>

            <div
              class="flex flex-col gap-3 xl:flex-row"
              :class="savedData.Tr_pp_status === 'process' ? 'hidden' : ''"
            >
              <div class="lg:w-1/2">
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  Status Pembayaran
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan Status Pembayaran"
                  class="w-full mb-2 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-semibold outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  :class="{
                    'text-warning': savedData.Tr_pp_status === 'process',
                    'text-danger': savedData.Tr_pp_status === 'rejected',
                    'text-success': savedData.Tr_pp_status === 'paid',
                  }"
                  v-model="savedData.Tr_pp_status"
                />
              </div>
              <div class="lg:w-1/2">
                <label
                  class="mb-3 mt-2 block text-sm font-medium text-black dark:text-white"
                >
                  <span v-if="savedData.Tr_pp_status === 'paid'">Dibayar Oleh</span>
                  <span v-else>Dibatalkan Oleh</span>
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan Nama Supplier"
                  class="w-full mb-2 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_pp_user_paid"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard
          cardTitle="Data Tambahan"
          @download="downloadPDF"
          :download="savedData.Tr_pp_status === 'process' ? false : true"
          @payment="alertPayment"
          :payment="savedData.Tr_pp_status === 'process' ? true : false"
          @paymentCancel="alertCancel"
          :paymentCancel="savedData.Tr_pp_status === 'process' ? true : false"
        >
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
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_pp_created_date"
                />
              </div>
              <div>
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Pengiriman Barang
                </label>
                <div
                  @click="
                    savedData.Tr_pp_shipment &&
                    savedData.Tr_pp_shipment.Tr_pp_shipment_courier
                      ? alertShipment(savedData._id, 'preview')
                      : ''
                  "
                >
                  <input
                    type="text"
                    readonly
                    placeholder="Masukkan Perusahaan Peminta"
                    class="w-full mb-2 font-semibold rounded-lg border-[1.5px] text-primary border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary cursor-pointer"
                    :value="
                      savedData.Tr_pp_shipment &&
                      savedData.Tr_pp_shipment.Tr_pp_shipment_courier
                        ? savedData.Tr_pp_shipment.Tr_pp_shipment_courier
                        : ''
                    "
                  />
                </div>
              </div>
            </div>
            <div
              class="flex flex-col gap-3 xl:flex-row"
              :class="savedData.Tr_pp_status === 'process' ? 'hidden' : ''"
            >
              <div :class="savedData.Tr_pp_status === 'rejected' ? 'w-full' : 'lg:w-1/2'">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  <span v-if="savedData.Tr_pp_status === 'paid'">Tgl. Dibayar</span>
                  <span v-else>Tgl. Dibatalkan</span>
                </label>
                <input
                  type="date"
                  disabled
                  placeholder="Rgl Bayar"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_pp_payment_date"
                />
              </div>
              <div :class="savedData.Tr_pp_status === 'rejected' ? 'hidden' : 'lg:w-1/2'">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Metode Pembayaran
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Masukan Metode Pembayaran"
                  class="w-full mb-2 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-1.5 px-4 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.Tr_pp_payment_method"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>

      <div class="col-span-2">
        <DefaultCard cardTitle="List Item"
          ><div class="overflow-auto" style="max-height: 300px">
            <!-- Tabel -->
            <div
              class="grid gap-0 grid-cols-[35px_110px_120px_75px_100px_150px_75px_75px_75px_110px_110px]"
            >
              <!-- Header -->
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                No.
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                ID Item
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Nama Item
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Satuan
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Jenis
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Keterangan
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Disc(%)
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Tax(%)
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Jumlah
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
              >
                Harga Satuan
              </div>
              <div
                class="p-2 text-center font-bold text-sm bg-gray-100 border border-gray-300 sticky top-0 z-10 dark:text-boxdark"
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
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_id"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Nama Item -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_nama"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Satuan -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_satuan"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    disabled
                    type="text"
                    v-model="row.item_jenis"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jenis -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    :disabled="savedData.Tr_pp_status === 'process' ? false : true"
                    type="text"
                    v-model="row.item_keterangan"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Disc -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    :disabled="savedData.Tr_pp_status === 'process' ? false : true"
                    type="number"
                    v-model="row.item_disc"
                    @change="validateQtyDisc(index, row)"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Tax -->
                <div class="px-1 py-0 border border-gray-300">
                  <input
                    :disabled="savedData.Tr_pp_status === 'process' ? false : true"
                    type="number"
                    v-model="row.item_tax"
                    @change="validateQtyTax(index, row)"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Jumlah -->
                <div class="px-1 py-0 pr-0 border border-gray-300">
                  <input
                    :disabled="savedData.Tr_pp_status === 'process' ? false : true"
                    type="number"
                    v-model="row.item_jumlah"
                    @input="calculateTotal(row)"
                    class="w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Harga Satuan -->
                <div
                  class="px-1 py-0 pr-0 border border-gray-300"
                  v-if="savedData.Tr_pp_status === 'process'"
                >
                  <input
                    type="number"
                    v-model="row.item_harga"
                    @input="calculateTotal(row)"
                    class="w-full px-2 py-0 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <div class="px-1 py-0 pr-0 border border-gray-300 text-right" v-else>
                  <div
                    class="h-full flex items-center justify-end pr-1 text-sm dark:text-white"
                  >
                    {{ formatNumber(row.item_harga) }}
                  </div>
                  <input
                    disabled
                    type="number"
                    v-model="row.item_harga"
                    @input="calculateTotal(row)"
                    class="hidden w-full px-2 py-1 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary dark:bg-boxdark dark:text-white"
                  />
                </div>
                <!-- Harga Total -->
                <div
                  class="w-full px-2 py-0 text-sm border border-gray-300 dark:text-white"
                >
                  <div class="h-full flex items-center justify-end">
                    {{ formatNumber(row.item_total) }}
                  </div>
                </div>
              </template>
            </div>
          </div>
        </DefaultCard>
        <div class="flex justify-between w-full bg-white dark:bg-boxdark">
          <div class="w-1/4 flex items-center justify-center p-5 flex-wrap">
            <span
              v-if="savedData.Tr_pp_status === 'paid' && savedData.Tr_pp_image"
              class="font-semibold"
              >Bukti Pembayaran</span
            >
            <ImagePreview
              v-if="savedData.Tr_pp_status === 'paid' && savedData.Tr_pp_image"
              :url="imageUrl"
              :src="savedData.Tr_pp_image"
            />
          </div>
          <div class="grid gap-0 grid-cols-[175px_125px]">
            <!-- Rows -->
            <!-- Sub Total -->
            <div
              class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              Sub Total
            </div>
            <div
              class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              <div class="h-full flex items-center justify-end">
                Rp.
                <span v-if="savedData.Tr_pp_status === 'process'">
                  {{ formatNumber(subTotal) }}
                </span>
                <span v-else>
                  {{
                    savedData && savedData.Tr_pp_payment_detail
                      ? formatNumber(savedData.Tr_pp_payment_detail.Tr_pp_payment_total)
                      : 0
                  }}
                </span>
              </div>
            </div>
            <!-- Discount -->
            <div
              class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              Discount
            </div>
            <div
              class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              <div class="h-full flex items-center justify-end">
                Rp.
                <span v-if="savedData.Tr_pp_status === 'process'">
                  {{ formatNumber(totalDiscount) }}
                </span>
                <span v-else>
                  {{
                    savedData && savedData.Tr_pp_payment_detail
                      ? formatNumber(
                          savedData.Tr_pp_payment_detail.Tr_pp_payment_discount
                        )
                      : 0
                  }}
                </span>
              </div>
            </div>
            <!-- Tax -->
            <div
              class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              Tax
            </div>
            <div
              class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              <div class="h-full flex items-center justify-end">
                Rp.
                <span v-if="savedData.Tr_pp_status === 'process'">
                  {{ formatNumber(totalTax) }}
                </span>
                <span v-else>
                  {{
                    savedData && savedData.Tr_pp_payment_detail
                      ? formatNumber(savedData.Tr_pp_payment_detail.Tr_pp_payment_tax)
                      : 0
                  }}
                </span>
              </div>
            </div>
            <!-- Shipping -->
            <div
              class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              Shipping
            </div>
            <div
              class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              <div class="h-full flex items-center justify-end">
                Rp.
                {{
                  savedData && savedData.Tr_pp_payment_detail
                    ? formatNumber(savedData.Tr_pp_payment_detail.Tr_pp_payment_shipping)
                    : 0
                }}
              </div>
            </div>
            <!-- Insurance -->
            <div
              class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              Insurance
            </div>
            <div
              class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              <div class="h-full flex items-center justify-end">
                Rp.
                {{
                  savedData && savedData.Tr_pp_payment_detail
                    ? formatNumber(savedData.Tr_pp_payment_detail.Tr_pp_payment_insurance)
                    : 0
                }}
              </div>
            </div>
            <!-- Total Order -->
            <div
              class="px-3 py-1 border border-gray-300 font-bold bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              Total Order
            </div>
            <div
              class="w-full px-2 py-0 text-xs border border-gray-300 bg-white text-sm dark:text-white dark:bg-boxdark"
            >
              <div class="h-full flex items-center justify-end font-semibold">
                Rp.
                <span v-if="savedData.Tr_pp_status === 'process'">
                  {{ formatNumber(subTotal - totalDiscount + totalTax) }}
                </span>
                <span v-else>
                  {{ formatNumber(savedData.Tr_pp_payment_amount) }}
                </span>
              </div>
            </div>
          </div>
        </div>
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
            <router-link
              to="/modules/work-order/purchase/pp"
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
