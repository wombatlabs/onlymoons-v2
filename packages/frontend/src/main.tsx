import { lazy, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import '@fontsource/red-hat-display/300.css'
import '@fontsource/red-hat-display/400.css'
import '@fontsource/red-hat-display/600.css'
import '@fontsource/red-hat-text/300.css'
import '@fontsource/red-hat-text/400.css'
import '@fontsource/red-hat-text/600.css'
import '@fontsource/red-hat-mono/300.css'
import '@fontsource/red-hat-mono/400.css'
import '@fontsource/red-hat-mono/600.css'
import './css/index.css'
import { Buffer } from 'buffer'
import { LoadingSuspense } from './components/LoadingView/LoadingSuspense'
globalThis.Buffer = Buffer

const ErrorPage = lazy(() => import('./pages/error'))
const IndexPage = lazy(() => import('./pages'))
const LockerPage = lazy(() => import('./pages/locker'))
const LockerCreatePage = lazy(() => import('./pages/locker/create'))
const LockerNetworkIndexPage = lazy(() => import('./pages/locker/[network]'))
const LockerNetworkIdPage = lazy(() => import('./pages/locker/[network]/[id]'))
const LockerSearchIndexPage = lazy(() => import('./pages/locker/search'))
const LockerSearchAddressPage = lazy(() => import('./pages/locker/search/[address]'))
// const SwapIndexPage = lazy(() => import('./pages/swap'))
// const CallerIndexPage = lazy(() => import('./pages/caller'))
// const AdvertisingIndexPage = lazy(() => import('./pages/advertising'))

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <LoadingSuspense children={<ErrorPage />} />,
    children: [
      {
        path: '/',
        element: <LoadingSuspense children={<IndexPage />} />,
      },
      {
        path: 'locker',
        children: [
          {
            path: '',
            element: <LoadingSuspense children={<LockerPage />} />,
          },
          {
            path: 'create',
            element: <LoadingSuspense children={<LockerCreatePage />} />,
          },
          {
            path: ':network',
            children: [
              {
                path: '',
                element: <LoadingSuspense children={<LockerNetworkIndexPage />} />,
              },
              {
                path: ':id',
                element: <LoadingSuspense children={<LockerNetworkIdPage />} />,
              },
            ],
          },
          {
            path: 'search',
            children: [
              {
                path: '',
                element: <LoadingSuspense children={<LockerSearchIndexPage />} />,
              },
              {
                path: ':address',
                element: <LoadingSuspense children={<LockerSearchAddressPage />} />,
              },
            ],
          },
        ],
      },
      // {
      //   path: 'swap/:chainId?/:from?/:to?',
      //   children: [
      //     {
      //       path: '',
      //       element: <LoadingSuspense children={<SwapIndexPage />} />,
      //     },
      //   ],
      // },
      // {
      //   path: 'caller',
      //   children: [
      //     {
      //       path: '',
      //       element: <LoadingSuspense children={<CallerIndexPage />} />,
      //     },
      //   ],
      // },
      // {
      //   path: 'advertising',
      //   children: [
      //     {
      //       path: '',
      //       element: <LoadingSuspense children={<AdvertisingIndexPage />} />,
      //     },
      //   ],
      // },
    ],
  },
])

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
