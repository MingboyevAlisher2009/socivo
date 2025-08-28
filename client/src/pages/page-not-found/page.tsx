import SeoHead from "@/components/hamlet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <>
      <SeoHead
        title="Page not found"
        description="Oops! The page you're looking for doesn’t exist or may have been moved. Return to the homepage to continue exploring."
      />

      <div className="flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-lg rounded-2xl border-green-200">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center mb-6"
              >
                <AlertTriangle className="h-16 w-16 text-green-600" />
              </motion.div>

              <h1 className="text-3xl font-bold text-green-700 mb-2">
                404 - Page Not Found
              </h1>
              <p className="text-green-600 mb-6">
                Oops! The page you’re looking for doesn’t exist or has been
                moved.
              </p>

              <Link to="/">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md">
                  <Home className="mr-2 h-4 w-4" /> Go Back Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
