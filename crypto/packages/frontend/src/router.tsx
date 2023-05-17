import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { Layout } from "./components/layout";

const VotePage = lazy(() => import("./pages/vote"));
const GeneratePage = lazy(() => import("./pages/generate"));
const DecryptPage = lazy(() => import("./pages/decrypt"));
const KeyGenPage = lazy(() => import("./pages/keygen"));
const ElectionPage = lazy(() => import("./pages/preelection"));
const FilterPage = lazy(() => import("./pages/filter"));
const Fallback = () => <></>;

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route element={<Layout />}>
            <Route
              path="keygen"
              element={
                <Suspense fallback={<Fallback />}>
                  <KeyGenPage />
                </Suspense>
              }
            />
            <Route
              path="preelection/:sessionId"
              element={
                <Suspense fallback={<Fallback />}>
                  <ElectionPage />
                </Suspense>
              }
            />
            <Route
              path="filter"
              element={
                <Suspense fallback={<Fallback />}>
                  <FilterPage />
                </Suspense>
              }
            />

            <Route
              path="vote/:sessionId"
              element={
                <Suspense fallback={<Fallback />}>
                  <VotePage />
                </Suspense>
              }
            />
            <Route
              path="generate/:sessionId"
              element={
                <Suspense fallback={<Fallback />}>
                  <GeneratePage />
                </Suspense>
              }
            ></Route>
            <Route
              path="decrypt/:sessionId"
              element={
                <Suspense fallback={<Fallback />}>
                  <DecryptPage />
                </Suspense>
              }
            ></Route>
            <Route
              path="generate"
              element={
                <Suspense fallback={<Fallback />}>
                  <GeneratePage />
                </Suspense>
              }
            ></Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
