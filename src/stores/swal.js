import Swal from "sweetalert2";

// Others
export const showLoading = async () => {
    Swal.fire({
        title: 'Loading...',
        text: 'Please wait!',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
}

export const confirmDelete = async (title, text, onConfirm) => {
  const result = await Swal.fire({
    title: title || 'Delete',
    text: text || 'Are you sure to delete?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
  });

  // Execute the callback if confirmed
  if (result.isConfirmed && typeof onConfirm === 'function') {
    await onConfirm();
  }
}

// Success
export const successCreate  = async (title, text, position) => {
    Swal.fire({
        position: position || "center",
        title: title || 'Create Success!',
        text: text || '',
        timer: 1500,
        icon: 'success',
        showConfirmButton: false,
        toast: true
      })
}
export const successEdit  = async (title, text) => {
    Swal.fire({
        title: title || 'Edit Success!',
        text: text ||  '',
        timer: 1500,
        icon: 'success',
        showConfirmButton: false
      })
}
export const successJoin  = async (title, text) => {
  Swal.fire({
      title: title || 'Join Success!',
      text: text ||  '',
      timer: 1500,
      icon: 'success',
      showConfirmButton: false
    })
}

export const successDelete  = async (title, text) => {
  Swal.fire({
      title: title || 'Delete Success!',
      text: text ||  '',
      timer: 1500,
      icon: 'success',
      showConfirmButton: false
    })
}

// Failed
export const failedCreate = async (data) => {
    Swal.fire({
        title: 'Failed!',
        text: 'Create Failed : '+data,
        icon: 'error'
      })
}
export const failedEdit = async (data) => {
    Swal.fire({
        title: 'Failed!',
        text: 'Edit Failed : '+data,
        icon: 'error'
      })
}
export const failedJoin = async (data) => {
    Swal.fire({
        title: 'Failed!',
        text: 'Join Failed : '+data,
        icon: 'error'
      })
}