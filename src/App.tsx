
import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from '@/components/ErrorBoundary';
import QueryProvider from '@/components/QueryProvider';
import LoadingState from '@/components/LoadingState';

// Lazy load pages for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Wardrobe = React.lazy(() => import("./pages/Wardrobe"));
const StyleAnalysis = React.lazy(() => import("./pages/StyleAnalysis"));
const FashionTrends = React.lazy(() => import("./pages/FashionTrends"));
const Community = React.lazy(() => import("./pages/Community"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Admin = React.lazy(() => import("./pages/Admin"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const AppRoutes = () => (
  <Suspense fallback={<LoadingState message="Loading page..." />}>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/wardrobe" element={<Wardrobe />} />
      <Route path="/style-analysis" element={<StyleAnalysis />} />
      <Route path="/fashion-trends" element={<FashionTrends />} />
      <Route path="/community" element={<Community />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<Admin />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ErrorBoundary>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
