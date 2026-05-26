import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, Eye, FileText, Loader2, UploadCloud } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB"];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function DocumentUploadManager({ compact = false }) {
  const { student } = useAuth();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingType, setUploadingType] = useState("");
  const inputRefs = useRef({});

  const fetchDocuments = useCallback(async () => {
    if (!student?.Legacy_ID) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        legacyId: student.Legacy_ID,
        email: student.Email || "",
      });
      const response = await fetch(`http://localhost:5000/documents?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch documents");
      }

      setDocumentTypes(data.documentTypes || []);
      setDocuments(data.documents || []);
    } catch (fetchError) {
      console.error("FETCH_DOCUMENTS_ERROR:", fetchError);
      setError(fetchError.message || "Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchDocuments, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchDocuments]);

  const uploadDocument = async (documentType, file) => {
    setError("");
    setMessage("");

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 5MB or less.");
      return;
    }

    const formData = new FormData();
    formData.append("legacyId", student.Legacy_ID);
    formData.append("email", student.Email || "");
    formData.append("documentType", documentType);
    formData.append("document", file);

    setUploadingType(documentType);

    try {
      const response = await fetch("http://localhost:5000/documents/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Upload failed");
      }

      setMessage(data.message || "Document uploaded successfully");
      await fetchDocuments();
    } catch (uploadError) {
      console.error("UPLOAD_DOCUMENT_ERROR:", uploadError);
      setError(uploadError.message || "Upload failed");
    } finally {
      setUploadingType("");
      if (inputRefs.current[documentType]) {
        inputRefs.current[documentType].value = "";
      }
    }
  };

  const documentByType = new Map(documents.map((doc) => [doc.documentType, doc]));

  return (
    <div className="space-y-4">
      {message && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
          Loading uploaded documents...
        </div>
      )}

      {!loading && (
        <div className={`grid grid-cols-1 gap-3 ${compact ? "" : "lg:grid-cols-2"}`}>
          {documentTypes.map((documentType) => {
            const document = documentByType.get(documentType);
            const isUploading = uploadingType === documentType;

            return (
              <div
                key={documentType}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-indigo-600" />
                      <h4 className="font-bold text-gray-900">{titleCase(documentType)}</h4>
                    </div>

                    {document ? (
                      <div className="mt-2 space-y-1">
                        <p className="truncate text-sm font-medium text-gray-700">
                          {document.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(document.size)} - {new Date(document.uploadedAt).toLocaleString()}
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                          <CheckCircle size={12} />
                          {document.status}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">No file uploaded yet.</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {document && (
                      <a
                        href={`http://localhost:5000/documents/file/${student.Legacy_ID}/${document.filename}?legacyId=${student.Legacy_ID}&email=${encodeURIComponent(student.Email || "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                        title="Preview document"
                      >
                        <Eye size={17} />
                      </a>
                    )}

                    <input
                      ref={(node) => {
                        inputRefs.current[documentType] = node;
                      }}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(event) => uploadDocument(documentType, event.target.files?.[0])}
                    />

                    <button
                      type="button"
                      onClick={() => inputRefs.current[documentType]?.click()}
                      disabled={isUploading}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                      {document ? "Update" : "Upload"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
