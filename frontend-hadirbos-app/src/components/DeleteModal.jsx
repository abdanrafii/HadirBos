import React from "react";

const DeleteModal = ({ userName, onDelete, closeModal }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full relative text-center">
        <button
          type="button"
          className="text-gray-500 absolute top-2.5 right-2.5 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5"
          onClick={closeModal}
        >
          <svg
            aria-hidden="true"
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span className="sr-only">Close modal</span>
        </button>

        <svg
          className="text-gray-400 w-11 h-11 mb-3.5 mx-auto"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>

        <p className="mb-4 text-gray-700">
          Are you sure you want to delete <strong>{userName}</strong>?
        </p>

        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={closeModal}
            type="button"
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200"
          >
            No, cancel
          </button>
          <button
            onClick={onDelete}
            type="button"
            className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300"
          >
            Yes, I'm sure
          </button>
        </div>
      </div>
    </div>
  );
};


// const DeleteModal = ({ userName, onDelete, closeModal }) => {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md w-full relative text-center">
//         <button
//           className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
//           onClick={closeModal}
//         >
//           ✕
//         </button>
//         <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//           Confirm Delete
//         </h2>
//         <p className="text-gray-600 dark:text-gray-300 mb-6">
//           Are you sure you want to delete <strong>{userName}</strong>?
//         </p>
//         <div className="flex justify-center gap-4">
//           <button
//             onClick={closeModal}
//             className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-gray-800"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onDelete}
//             className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

export default DeleteModal;
