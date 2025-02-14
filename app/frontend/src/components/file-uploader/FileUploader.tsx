import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Trash, Upload } from "lucide-react";

const UploadExcelOrders = () => {
  const [fileData, setFileData] = useState([]);
  const [file, setFile] = useState<File | null>(null);

  console.log(fileData);

  const handleRemoveFile = () => {
    setFile(null);
    setFileData([]);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];

    if (
      !selectedFile.name.endsWith(".xlsx") &&
      !selectedFile.name.endsWith(".xls")
    ) {
      alert("Invalid file type. Please upload an Excel file (.xlsx or .xls).");
      return;
    }

    // Validate file size (max 2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      alert("File size must be under 2MB.");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: A[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Map Excel columns to object fields
      const orders = rows.slice(1).map((row) => ({
        orderDate: new Date(row[0]), // Ngày order
        SKU: row[1], // SKU
        size: parseFloat(row[2]), // Size
        deposit: parseFloat(row[3]), // Cọc
        totalPrice: parseFloat(row[4]), // Giá
        userName: row[5], // Tên khách (we will convert to userId)
        orderNumber: row[6], // Order Number
        deliveryCode: row[7], // MVĐ
        checkBox: row[8] === "Yes", // Hộp kiểm
        sourceName: row[9], // Nguồn (we will convert to sourceId)
        shippingFee: parseFloat(row[10]), // Cước vận chuyển 1
        shippingStoreName: row[11], // Kho vận chuyển (we will convert to shippingStoreId)
        status: row[12] || "ONGOING", // Trạng thái
      }));

      setFileData(orders as A);
    };

    reader.readAsArrayBuffer(selectedFile);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  const handleUpload = async () => {
    if (fileData.length === 0) return alert("No orders to upload!");
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className="border p-4 cursor-pointer rounded-lg text-center"
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-2 justify-center">
            <Upload size={16} />
            <p>Kéo thả hoặc tải file</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border p-3 rounded-lg bg-gray-100">
          <span>{file.name}</span>
          <Button variant="destructive" size="icon" onClick={handleRemoveFile}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      )}

      <Button onClick={handleUpload} disabled={!file || fileData.length === 0}>
        Upload Orders
      </Button>
    </div>
  );
};

export default UploadExcelOrders;
