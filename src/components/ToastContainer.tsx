import React from "react";
import { useCartWishlist } from "../context/CartWishlistContext";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCartWishlist();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Determine theme styles
          let bg = "bg-white border-l-4 border-emerald-500 shadow-xl";
          let textColor = "text-slate-800";
          let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;

          if (toast.type === "error") {
            bg = "bg-red-50 border-l-4 border-rose-500 shadow-xl";
            textColor = "text-rose-950";
            icon = <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
          } else if (toast.type === "warning") {
            bg = "bg-amber-50 border-l-4 border-amber-500 shadow-xl";
            textColor = "text-amber-950";
            icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
          } else if (toast.type === "info") {
            bg = "bg-blue-50 border-l-4 border-blue-500 shadow-xl";
            textColor = "text-blue-950";
            icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`${bg} p-4 rounded-r-lg flex items-start gap-3 pointer-events-auto shadow-md border border-slate-100`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-tight">
                <p className={`${textColor}`}>{toast.text}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
