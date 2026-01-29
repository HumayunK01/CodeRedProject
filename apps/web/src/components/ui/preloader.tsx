import { motion } from "framer-motion";

export const Preloader = () => {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
            <div className="relative flex flex-col items-center">
                <motion.img
                    src="/preloader.gif"
                    alt="Loading..."
                    className="w-48 h-48 md:w-64 md:h-64 object-contain"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </motion.div>
    );
};
