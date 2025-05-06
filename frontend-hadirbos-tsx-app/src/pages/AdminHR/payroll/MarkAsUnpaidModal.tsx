import { useState } from "react";
import { processPayment } from "../../../services/payrollService";
import { Payroll } from "../../../types/payroll";
import { getCurrentUser } from "../../../services/authService";

interface MarkAsUnpaidModalProps {
  payrollRecord: Payroll;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MarkAsUnpaidModal({
  payrollRecord,
  onClose,
  onSuccess,
}: MarkAsUnpaidModalProps) {
  const userInfo = getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitUnpaid = async () => {
    try {
      setLoading(true);
      await processPayment(
        payrollRecord._id,
        {
          status: "unpaid",
        },
        userInfo.token
      );

      onSuccess();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Mark as Unpaid</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to mark{" "}
          <strong>{payrollRecord.employeeId.name}</strong> payroll as{" "}
          <strong>unpaid</strong>?
        </p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitUnpaid}
            className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Mark as Unpaid"}
          </button>
        </div>
      </div>
    </div>
  );
}
