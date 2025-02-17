import { Button } from "@/components/ui/button";
import { Trash, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

interface UploadExcelOrderProps<TData> {
  file?: File | null;
  setFile?: React.Dispatch<React.SetStateAction<File | null>>;
  fileData: TData[];
  setFileData: React.Dispatch<React.SetStateAction<A[]>>;
  mapper: (rows: A[]) => TData[];
  accept?: Accept;
}

const UploadExcelOrders = <TData,>(props: UploadExcelOrderProps<TData>) => {
  const {
    file: fileProps,
    accept,
    setFile: setFileProps,
    setFileData,
    mapper,
  } = props;
  // const [fileData, setFileData] = useState([]);
  const [internalFile, setInternalFile] = useState<File | null>(null);

  const file = fileProps ?? internalFile;
  const setFile = setFileProps ?? setInternalFile;

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

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, {
        type: "array",
        cellDates: true,
        dateNF: "yyyy-mm-dd",
      });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: A[] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        // raw: false,
        blankrows: false,
      });

      // Map Excel columns to object fields
      const orders = mapper(rows);

      setFileData(orders as A);
    };

    reader.readAsArrayBuffer(selectedFile);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: accept ?? {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

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
    </div>
  );
};

export default UploadExcelOrders;
