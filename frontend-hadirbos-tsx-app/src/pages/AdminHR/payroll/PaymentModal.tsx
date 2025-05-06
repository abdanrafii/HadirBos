import { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import { Payroll } from "../../../types/payroll";
import { UserBase } from "../../../types/user";
import { getCurrentUser } from "../../../services/authService";
import { getUserById } from "../../../services/userService";
import Loading from "../../../components/Loading";
import { processPayment } from "../../../services/payrollService";

type PaymentModalProps = {
  payrollRecord: Payroll;
  onClose: () => void;
  onSuccess: () => void;
};

const PaymentModal = ({ payrollRecord, onClose, onSuccess }: PaymentModalProps) => {
  const [error, setError] = useState("");
  const [detailUser, setDetailUser] = useState<UserBase | null>(null);
  const [loadDetail, setLoadDetail] = useState(false);
  const userInfo = getCurrentUser();

  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentNotes, setPaymentNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetailUsers = async () => {
      try {
        setLoadDetail(true);
        const data = await getUserById(
          payrollRecord.employeeId._id,
          userInfo.token
        );
        setDetailUser(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoadDetail(false);
      }
    };

    fetchDetailUsers();
  }, [payrollRecord.employeeId._id, userInfo.token]);

  const handleClose = () => {
    onClose();
  };

  const idrFormatter = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmitPayment = async () => {
    try {
      setLoading(true);
      await processPayment(
        payrollRecord._id,
        {
          status: "paid",
          paymentMethod,
          paymentReference,
          paymentDate,
          notes: paymentNotes,
        },
        userInfo.token
      );

      onSuccess();
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } 
      // alert("Failed to process payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-6">
            {error}
          </div>
        )}

        {loadDetail ? (
          <Loading />
        ) : (
          <>
            <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">
                Process Payment
              </h2>
              <p className="text-sm text-gray-600">
                Employee: {detailUser?.name}
              </p>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount
                </label>
                <div className="text-2xl font-bold text-gray-800">
                  {idrFormatter(payrollRecord?.totalAmount)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value as "bank" | "cash" | "check"
                    )
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                </select>
              </div>

              {paymentMethod === "bank" && detailUser?.accountNumber && (
                <p className="text-sm text-gray-600">
                  Transfer to account:{" "}
                  <span className="font-medium">
                    {detailUser.accountNumber}
                  </span>
                </p>
              )}

              {/* Payment Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  placeholder="Enter payment reference"
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate.toISOString().split("T")[0]}
                  onChange={(e) => setPaymentDate(new Date(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={paymentNotes}
                  placeholder="Enter notes"
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
                onClick={handleSubmitPayment}
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-1" />
                    Process Payment
                  </>
                )}{" "}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
